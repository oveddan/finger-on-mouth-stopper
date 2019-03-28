import * as knnClassifier from "@tensorflow-models/knn-classifier";
import * as tf from '@tensorflow/tfjs';
import { Keypoints } from "./types";

export type Dataset = {
  [classId: number]: tf.Tensor<tf.Rank.R2>
};

export type DatasetObject = {
  [classId: number]: Keypoints[]
};

const storageKey = "poseClassification";

export type StorageEntry = {
  dataset: DatasetObject,
  labels: string[]
}

export async function saveClassifierAndLabelsInLocalStorage(dataset: DatasetObject, labels: string[]) {
  const storageEntry = {
    dataset,
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
export function loadClassifierLabelsFromLocalStorage(): StorageEntry {
  const storageJson = localStorage.getItem(storageKey);

  if (storageJson) {
    return JSON.parse(storageJson) as StorageEntry;
 }

  return {
    labels: [],
    dataset: {}
  };
}
