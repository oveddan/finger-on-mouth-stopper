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

type StorageEntry = {
  dataset: DatasetObject,
  labels: string[]
}

export async function saveClassifierAndLabelsInLocalStorage(classifier: knnClassifier.KNNClassifier, labels: string[]) {
  const dataset = classifier.getClassifierDataset();
  const datasetOjb: DatasetObject = await toDatasetObject(dataset);
  const storageEntry = {
    dataset: datasetOjb,
    labels
  };
  const jsonStr = JSON.stringify(storageEntry);
  //can be change to other source
  localStorage.setItem(storageKey, jsonStr);
}

/**
 * 
 * @param classifier 
 * 
 * @returns the list of labels
 */
export function loadClassifierAndLabelsFromLocalStorage(classifier: knnClassifier.KNNClassifier): string[] | null {
  const storageJson = localStorage.getItem(storageKey);

  if (storageJson) {
    const storageEntry = JSON.parse(storageJson) as StorageEntry;

    const dataset = fromDatasetObject(storageEntry.dataset);

    classifier.setClassifierDataset(dataset);

    return storageEntry.labels;
  }

  return null;
}
