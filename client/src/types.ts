import {KNNClassifier} from '@tensorflow-models/knn-classifier';
import {Tensor2D} from '@tensorflow/tfjs';
import {ActionType} from 'typesafe-actions';

import * as actions from './actions';

export type CameraFrameType = HTMLVideoElement|HTMLImageElement;

export type Keypoint = [number, number];
export type Keypoints = Keypoint[];

export type Dataset = {
  [classId: number]: Tensor2D
};

export type CameraDatasets = {
  [cameraId: number]: DatasetObject
}

export type CameraKeypoints = {
  [cameraId: number]: Keypoints|undefined
}

export type CameraFrames = {
  [cameraId: number]: {frame: CameraFrameType, updateTime: number}
};

export type DatasetObject = {
  [classId: number]: Keypoints[]
};

export type Labels = {
  [id: number]: string
};

export type StorageEntry = {
  dataset: CameraDatasets,
  activities: Labels
};

export type CameraClassifiers = {
  [cameraId: number]: KNNClassifier
}

export type CameraClassifications = {
  [cameraId: number]: number|null
};

export type RootAction = ActionType<typeof import('./rootAction').default>;
