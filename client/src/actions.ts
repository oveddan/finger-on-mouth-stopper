import {action, ActionType} from 'typesafe-actions';

import {ADD_EXAMPLE, ADD_LABEL, CLEAR_DATASET, DELETE_EXAMPLE, KEYPOINTS_ESTIMATED, SET_DATASET, UPDATE_LABEL} from './constants';
import {CameraDatasets, DatasetObject, Keypoints, Labels} from './types';

export const addExample = (classId: number, cameraId: number) =>
    action(ADD_EXAMPLE, {classId, cameraId});

export const deleteExample =
    (classId: number, cameraId: number, example: number) =>
        action(DELETE_EXAMPLE, {classId, cameraId, example});

export const setDatasets = (dataset: CameraDatasets, activities: Labels) =>
    action(SET_DATASET, {dataset, activities});

export const clearDataset = (cameraId: number) =>
    action(CLEAR_DATASET, cameraId);

export const addLabel = (text: string) => action(ADD_LABEL, text);

export const updateLabel = (id: number, text: string) =>
    action(UPDATE_LABEL, {id, text});

export const keypointsEstimated = (keypoints: Keypoints, cameraId: number) =>
    action(KEYPOINTS_ESTIMATED, {keypoints, cameraId});

const actions = {
  addExample,
  deleteExample,
  setDatasets,
  clearDataset,
  addLabel,
  updateLabel,
  keypointsEstimated
};
// export type RootAction = ActionType<ActionTypes>;

export type Action = ActionType<typeof actions>;
