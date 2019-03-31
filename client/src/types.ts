import {KNNClassifier} from '@tensorflow-models/knn-classifier';
import {Tensor2D} from '@tensorflow/tfjs';

export type Keypoint = [number, number];
export type Keypoints = Keypoint[];

export type Dataset = {
  [classId: number]: Tensor2D
};

export type CameraDatasets = {
  [cameraId: number]: DatasetObject
}

export type CameraKeypoints = {
  [cameraId: number]: Keypoints
}

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
