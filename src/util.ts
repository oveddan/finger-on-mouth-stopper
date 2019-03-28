import { KNNClassifier } from "@tensorflow-models/knn-classifier";
import * as tf from '@tensorflow/tfjs';

export function chunk<T>(input: T[], chunkSize: number): T[][] {
  const result: T[][] = [];

  let i,j;
  for (i=0, j=input.length; i<j; i+=chunkSize) {
    result.push(input.slice(i,i+chunkSize));
  }

  return result;
}

export const deleteExample = (classifier: KNNClassifier, classId: number, example: number) => {
  const dataset = classifier.getClassifierDataset();

  const classExamples = dataset[classId].clone();

  classifier.clearClass(classId);

  tf.tidy(() => {
    for(let i = 0; i < classExamples.shape[0]; i++) {
      if (i !== example) {
        const exampleToAddBack = classExamples.slice([i, 0], [1, classExamples.shape[1]]).squeeze();
        classifier.addExample(exampleToAddBack, classId);
      }
    }
  });
  
  console.log('after shape', classifier.getClassifierDataset()[classId]);

  classExamples.dispose();
}

export const sum = (values: number[]) => values.reduce((result, value) => value + result, 0);

export const mean = (values: number[]) => sum(values) / values.length; 