import * as knnClassifier from '@tensorflow-models/knn-classifier';
import * as tf from '@tensorflow/tfjs';

import {CameraDatasets, DatasetObject, Keypoints, Labels, StorageEntry} from './types';

const storageKey = 'poseClassification';

export async function saveDatasets(
    dataset: CameraDatasets, activities: Labels) {
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
export function loadDatasets(): StorageEntry|null {
  const storageJson = localStorage.getItem(storageKey);

  if (storageJson) {
    return JSON.parse(storageJson) as StorageEntry;
  }

  return null;
}
