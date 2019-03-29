import {DatasetObject, Keypoints} from './types';

export const ADD_EXAMPLE = 'ADD_EXAMPLE';
export const DELETE_EXAMPLE = 'DELETE_EXAMPLE';
export const SET_DATASET = 'SET_DATASET';
export const CLEAR_DATASET = 'CLEAR_DATASET';
export const ADD_LABEL = 'ADD_LABEL';
export const UPDATE_LABEL = 'UPDATE_LABEL';
export const KEYPOINTS_ESTIMATED = 'KEYPOINTS_ESTIMATED';

interface AddExampleAction {
  type: typeof ADD_EXAMPLE, classId: number
}

interface DeleteExampleAction {
  type: typeof DELETE_EXAMPLE, classId: number, example: number
}

interface SetDatsetAction {
  type: typeof SET_DATASET, dataset: DatasetObject, labels: string[]
}

interface ClearDatasetAction {
  type: typeof CLEAR_DATASET
}

interface AddLabelAction {
  type: typeof ADD_LABEL, text: string
}

interface UpdateLabelAction {
  type: typeof UPDATE_LABEL, id: number, text: string
}

interface KeypointsEstimatedAction {
  type: typeof KEYPOINTS_ESTIMATED, keypoints: Keypoints
}

export type ActionTypes =
    AddExampleAction|DeleteExampleAction|SetDatsetAction|ClearDatasetAction|
    AddLabelAction|UpdateLabelAction|KeypointsEstimatedAction;

export const addExample = (classId: number): AddExampleAction =>
    ({type: ADD_EXAMPLE, classId});

export const deleteExample =
    (classId: number, example: number): DeleteExampleAction =>
        ({type: DELETE_EXAMPLE, classId, example});

export const setDataset =
    (dataset: DatasetObject, labels: string[]): SetDatsetAction =>
        ({type: SET_DATASET, dataset, labels});

export const clearDataset = (): ClearDatasetAction => ({type: CLEAR_DATASET});

export const addLabel = (text: string): AddLabelAction =>
    ({type: ADD_LABEL, text});

export const updateLabel = (id: number, text: string): UpdateLabelAction =>
    ({type: UPDATE_LABEL, id, text});

export const keypointsEstimated =
    (keypoints: Keypoints): KeypointsEstimatedAction =>
        ({type: KEYPOINTS_ESTIMATED, keypoints});
