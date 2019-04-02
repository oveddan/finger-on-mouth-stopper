import {KNNClassifier} from '@tensorflow-models/knn-classifier';
import {Tensor2D} from '@tensorflow/tfjs';
import * as moment from 'moment';
import {number} from 'prop-types';
import {ActionType} from 'typesafe-actions';

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

export type Activity = string;

export type Activities = {
  [id: number]: Activity
};

export type CameraActivities = {
  [cameraId: number]: Activities
}

export type StorageEntry = {
  dataset: CameraDatasets,
  activities: CameraActivities
};

export type CameraClassifiers = {
  [cameraId: number]: KNNClassifier
}

export type CameraClassification = {
  classId: number,
  score: number
}|null;

export type CameraClassifications = {
  [cameraId: number]: CameraClassification
};

export type RootAction = ActionType<typeof import('./actions').default>;

export type ScheduleActivity = {
  cameraId: number,
  classId: number
};

export type ScheduleEntry = {
  start: moment.Moment,
  end: moment.Moment,
  activity: ScheduleActivity
};

export type Schedule = {
  [entryId: number]: ScheduleEntry
};

export enum ComplianceStatus {
  NO_ACTIVITY_SCHEDULED = 'NO ACTIVITY SCHEDULE',
  NOT_COMPLYING = 'NOT COMPLYING',
  COMPLYING = 'COMPLYING',
  NOT_SURE = 'NOT_SURE'
}
