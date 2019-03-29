import {Tensor2D} from '@tensorflow/tfjs';

export type Keypoint = [number, number];
export type Keypoints = Keypoint[];

export type Dataset = {
  [classId: number]: Tensor2D
};

export type DatasetObject = {
  [classId: number]: Keypoints[]
};

export type StorageEntry = {
  dataset: DatasetObject,
  labels: string[]
};

export type State = {
  dataset: DatasetObject,
  labels: string[],
  keypoints?: Keypoints
};
