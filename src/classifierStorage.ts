import * as knnClassifier from "@tensorflow-models/knn-classifier";
import * as tf from '@tensorflow/tfjs';

type Dataset = {
  [classId: number]: tf.Tensor<tf.Rank.R2>
};

type DatasetObjectEntry = {
  classId: number,
  data: number[],
  shape: [number, number]
};

type DatasetObject = DatasetObjectEntry[];

async function toDatasetObject(dataset: Dataset): Promise<DatasetObject> {
  const result: DatasetObject = await Promise.all(
    Object.entries(dataset).map(async ([classId,value], index) => {
      const data = await value.data();

      return {
        classId: Number(classId),
        data: Array.from(data),
        shape: value.shape
      };
   })
  );

  return result;
};

function fromDatasetObject(datasetObject: DatasetObject): Dataset {
  return Object.entries(datasetObject).reduce((result: Dataset, [indexString, {data, shape}]) => {
    const tensor = tf.tensor2d(data, shape);
    const index = Number(indexString);

    result[index] = tensor;

    return result;
  }, {});

}

const storageKey = "poseClassification";

export async function saveClassifierInLocalStorage(classifier: knnClassifier.KNNClassifier) {
  const dataset = classifier.getClassifierDataset();
  const datasetOjb: DatasetObject = await toDatasetObject(dataset);
  const jsonStr = JSON.stringify(datasetOjb);
  //can be change to other source
  localStorage.setItem(storageKey, jsonStr);
}

export function loadClassifierFromLocalStorage(classifier: knnClassifier.KNNClassifier): void {
  const datasetJson = localStorage.getItem(storageKey);

  if (datasetJson) {
    const datasetObj = JSON.parse(datasetJson) as DatasetObject;

    const dataset = fromDatasetObject(datasetObj);

    classifier.setClassifierDataset(dataset);
  }
}
