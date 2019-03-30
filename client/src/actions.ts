import {action, ActionType} from 'typesafe-actions';

import {ADD_EXAMPLE, ADD_LABEL, CLEAR_DATASET, DELETE_EXAMPLE, KEYPOINTS_ESTIMATED, SET_DATASET, UPDATE_LABEL} from './constants';
import {DatasetObject, Keypoints, Labels} from './types';
// interface AddExampleAction {
//   type: typeof ADD_EXAMPLE, classId: number
// }

// interface DeleteExampleAction {
//   type: typeof DELETE_EXAMPLE, classId: number, example: number
// }

// interface SetDatsetAction {
//   type: typeof SET_DATASET, dataset: DatasetObject, activities: Activities
// }

// interface ClearDatasetAction {
//   type: typeof CLEAR_DATASET
// }

// interface AddLabelAction {
//   type: typeof ADD_LABEL, text: string
// }

// interface UpdateLabelAction {
//   type: typeof UPDATE_LABEL, id: number, text: string
// }

// interface KeypointsEstimatedAction {
//   type: typeof KEYPOINTS_ESTIMATED, keypoints: Keypoints
// }

// export type ActionTypes =
//     AddExampleAction|DeleteExampleAction|SetDatsetAction|ClearDatasetAction|
//     AddLabelAction|UpdateLabelAction|KeypointsEstimatedAction;

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
