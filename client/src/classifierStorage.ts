import * as knnClassifier from '@tensorflow-models/knn-classifier';
import * as tf from '@tensorflow/tfjs';

import {Activities, DatasetObject, Keypoints, StorageEntry} from './types';

const storageKey = 'poseClassification';

export async function saveClassifierAndLabelsInLocalStorage(
    dataset: DatasetObject, activities: Activities) {
  const storageEntry = {dataset, activities};

  const jsonStr = JSON.stringify(storageEntry);
  // can be change to other source
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

  return {activities: {}, dataset: {}};
}
