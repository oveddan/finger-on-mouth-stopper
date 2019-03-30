import {Tensor2D} from '@tensorflow/tfjs';

export type Keypoint = [number, number];
export type Keypoints = Keypoint[];

export type Dataset = {
  [classId: number]: Tensor2D
};

export type DatasetObject = {
  [classId: number]: Keypoints[]
};

export type Activities = {
  [id: number]: string
};

export type State = {
  readonly dataset: DatasetObject,
  readonly activities: Activities,
  readonly keypoints?: Keypoints
};

export type StorageEntry = {
  dataset: DatasetObject,
  activities: Activities
};

import {StateType, ActionType} from 'typesafe-actions';
