import {action} from 'typesafe-actions';

import {ACTIVITY_CLASSIFIED, ADD_EXAMPLE, ADD_LABEL, CAMERA_FRAME_UPDATED, CAMERA_STATUS_UPDATED, CLEAR_DATASET, DELETE_EXAMPLE, KEYPOINTS_ESTIMATED, SET_DATASET, UPDATE_LABEL} from '../constants';
import {CamerasStatus} from '../serverApi';
import {CameraActivities, CameraClassification, CameraDatasets, CameraFrameType, CameraKeypoints} from '../types';

export const addExample = (classId: number, cameraId: number) =>
    action(ADD_EXAMPLE, {classId, cameraId})

export const deleteExample =
    (classId: number, cameraId: number, example: number) =>
        action(DELETE_EXAMPLE, {classId, cameraId, example})

export const initializeDataset =
    (camerasState: CamerasStatus, dataset: CameraDatasets,
     activities: CameraActivities) =>
        action(SET_DATASET, {camerasState, dataset, activities})

export const clearDataset = (cameraId: number) =>
    action(CLEAR_DATASET, {cameraId})

export const addLabel = (cameraId: number, text: string) =>
    action(ADD_LABEL, {cameraId, text});

export const updateLabel = (cameraId: number, id: number, text: string) =>
    action(UPDATE_LABEL, {cameraId, id, text})

export const keypointsEstimated = (keypoints: CameraKeypoints) =>
    action(KEYPOINTS_ESTIMATED, {keypoints})

export const updateCamerasStatus = (camerasStatus: CamerasStatus) =>
    action(CAMERA_STATUS_UPDATED, {camerasStatus})

export const poseClassified =
    (cameraId: number, classification: CameraClassification|null) =>
        action(ACTIVITY_CLASSIFIED, {cameraId, classification})

export const frameUpdated =
    (cameraId: number, frame: CameraFrameType, time: number) =>
        action(CAMERA_FRAME_UPDATED, {cameraId, frame, time})
