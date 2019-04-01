import {action, ActionType} from 'typesafe-actions';

import {ACTIVITY_CLASSIFIED, ADD_EXAMPLE, ADD_LABEL, CAMERA_FRAME_UPDATED, CAMERA_STATUS_UPDATED, CLEAR_DATASET, DELETE_EXAMPLE, KEYPOINTS_ESTIMATED, SET_DATASET, UPDATE_LABEL} from './constants';
import {CamerasStatus} from './serverApi';
import {CameraDatasets, CameraFrameType, CameraKeypoints, Keypoints, Labels} from './types';

export const addExample = (classId: number, cameraId: number) =>
    action(ADD_EXAMPLE, {classId, cameraId});

export const deleteExample =
    (classId: number, cameraId: number, example: number) =>
        action(DELETE_EXAMPLE, {classId, cameraId, example});

export const initializeDataset =
    (camerasState: CamerasStatus, dataset: CameraDatasets,
     activities: Labels) =>
        action(SET_DATASET, {camerasState, dataset, activities});

export const clearDataset = (cameraId: number) =>
    action(CLEAR_DATASET, {cameraId});

export const addLabel = (text: string) => action(ADD_LABEL, text);

export const updateLabel = (id: number, text: string) =>
    action(UPDATE_LABEL, {id, text})

export const keypointsEstimated = (keypoints: CameraKeypoints) =>
    action(KEYPOINTS_ESTIMATED, {keypoints})

export const updateCamerasStatus = (camerasStatus: CamerasStatus) =>
    action(CAMERA_STATUS_UPDATED, {camerasStatus})

export const poseClassified = (cameraId: number, classId: number|null) =>
    action(ACTIVITY_CLASSIFIED, {classId, cameraId})

export const frameUpdated =
    (cameraId: number, frame: CameraFrameType, time: number) =>
        action(CAMERA_FRAME_UPDATED, {cameraId, frame, time})

    // const actions = {
    //   addExample,
    //   deleteExample,
    //   initializeDataset,
    //   clearDataset,
    //   addLabel,
    //   updateLabel,
    //   keypointsEstimated,
    //   updateCamerasStatus,
    //   frameUpdated
    // };
    // export type RootAction = ActionType<ActionTypes>;
