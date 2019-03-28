import { KNNClassifier } from "@tensorflow-models/knn-classifier";
import * as tf from '@tensorflow/tfjs';
import { DatasetObject } from "./classifierStorage";

export function chunk<T>(input: T[], chunkSize: number): T[][] {
  const result: T[][] = [];

  let i,j;
  for (i=0, j=input.length; i<j; i+=chunkSize) {
    result.push(input.slice(i,i+chunkSize));
  }

  return result;
}

export const deleteExample = (dataset: DatasetObject, classId: number, example: number): DatasetObject => {
  const newDataset = {
    ...dataset
  };

  delete newDataset[classId];

  return newDataset;
}

export const addKeypointsToDataset = (keypoints: number[], dataset: DatasetObject, classId: number): DatasetObject => {
  const existingExample = dataset[classId] ? dataset[classId] : [];

  const keypointsByPart = chunk(keypoints, 2) as [number, number][];

  return {
    ...dataset,
    [classId]: [...existingExample, keypointsByPart] 
  };
}

const toExample = (keypoints: [number, number][]) => tf.tensor2d(keypoints);

export const updateClassExamples = (classifier: KNNClassifier, dataset: DatasetObject, classId: number) => {
  const keypoints = dataset[classId];
  if (keypoints) {
    if(classifier.getClassifierDataset()[classId])
      classifier.clearClass(classId);

    tf.tidy(() => {
      keypoints.forEach(keypoint => {
        classifier.addExample(toExample(keypoint), classId);
      })
    });
  }
};

export const setClassifierExamples = (classifier: KNNClassifier, dataset: DatasetObject) => {
  classifier.clearAllClasses();

  Object.keys(dataset).forEach(classId => {
    updateClassExamples(classifier, dataset, Number(classId));
  });
};

export const sum = (values: number[]) => values.reduce((result, value) => value + result, 0);

export const mean = (values: number[]) => sum(values) / values.length; 