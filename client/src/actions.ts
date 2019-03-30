import {action, ActionType} from 'typesafe-actions';

import {ADD_EXAMPLE, ADD_LABEL, CLEAR_DATASET, DELETE_EXAMPLE, KEYPOINTS_ESTIMATED, SET_DATASET, UPDATE_LABEL} from './constants';
import {DatasetObject, Keypoints, Labels} from './types';

export const addExample = (classId: number) => action(ADD_EXAMPLE, classId);

export const deleteExample = (classId: number, example: number) =>
    action(DELETE_EXAMPLE, {classId, example});

export const setDataset = (dataset: DatasetObject, activities: Labels) =>
    action(SET_DATASET, {dataset, activities});

export const clearDataset = () => action(CLEAR_DATASET);

export const addLabel = (text: string) => action(ADD_LABEL, text);

export const updateLabel = (id: number, text: string) =>
    action(UPDATE_LABEL, {id, text});

export const keypointsEstimated = (keypoints: Keypoints) =>
    action(KEYPOINTS_ESTIMATED, keypoints);

const actions = {
  addExample,
  deleteExample,
  setDataset,
  clearDataset,
  addLabel,
  updateLabel,
  keypointsEstimated
};
// export type RootAction = ActionType<ActionTypes>;

export type Action = ActionType<typeof actions>;
