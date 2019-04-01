import {create, KNNClassifier} from '@tensorflow-models/knn-classifier';
import * as tf from '@tensorflow/tfjs';
import {downloadPackedMatrixFromBuffer} from '@tensorflow/tfjs-core/dist/kernels/webgl/gpgpu_util';

import {CamerasStatus} from './serverApi';
import {CameraClassifiers, CameraDatasets, DatasetObject, Keypoints} from './types';

export function chunk<T>(input: T[], chunkSize: number): T[][] {
  const result: T[][] = [];

  let i, j;
  for (i = 0, j = input.length; i < j; i += chunkSize) {
    result.push(input.slice(i, i + chunkSize));
  }

  return result;
}

export const deleteExample =
    (dataset: DatasetObject, classId: number, example: number):
        DatasetObject => {
          const existingExamples = dataset[classId];
          const newExamples = [
            ...existingExamples.slice(0, example),
            ...existingExamples.slice(example + 1, existingExamples.length)
          ];

          const newDataset = {...dataset, [classId]: newExamples};

          return newDataset;
        }

export const addKeypointsToDataset =
    (keypoints: Keypoints, dataset: DatasetObject = {}, classId: number):
        DatasetObject => {
          const existingExample = dataset[classId] ? dataset[classId] : [];

          return {...dataset, [classId]: [...existingExample, keypoints]};
        }

export const toExample = (keypoints: [number, number][]) =>
    tf.tensor2d(keypoints);

export const updateClassExamples =
    (classifier: KNNClassifier, dataset: DatasetObject, classId: number) => {
      const keypoints = dataset[classId];
      // debugger;
      if (keypoints) {
        if (classifier.getClassifierDataset()[classId])
          classifier.clearClass(classId);

        tf.tidy(() => {keypoints.forEach(keypoint => {
                  const example = toExample(keypoint);
                  // debugger;
                  classifier.addExample(example, classId);
                })});
      }
    };

export const setClassifiersExamples =
    (cameras: CamerasStatus, classifiers: CameraClassifiers,
     datasets: CameraDatasets):
        CameraClassifiers => {
          const result: CameraClassifiers = {};
          Object.keys(cameras).forEach(id => {
            const cameraId = +id;

            const classifier = classifiers[cameraId] || create();

            setClassifierExamples(classifier, datasets[cameraId]);

            result[cameraId] = classifier;
          })

          return result;
        }

export const setClassifierExamples =
    (classifier: KNNClassifier, dataset: DatasetObject = {}) => {
      classifier.clearAllClasses();

      Object.keys(dataset).forEach(classId => {
        updateClassExamples(classifier, dataset, Number(classId));
      });
    };

export const sum = (values: number[]) =>
    values.reduce((result, value) => value + result, 0);

export const mean = (values: number[]) => sum(values) / values.length;

export function indexByOrder<T>(entries: T[]): {[id: number]: T} {
  return entries.reduce((result: {[id: number]: T}, entry, id) => {
    result[id] = entry;
    return result;
  }, {});
}
