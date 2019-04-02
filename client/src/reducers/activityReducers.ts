import {PoseNet} from '@tensorflow-models/posenet';
import {ActionType, StateType} from 'typesafe-actions';

import * as actions from '../actions/activityActions';
import {ACTIVITY_CLASSIFIED, ADD_EXAMPLE, ADD_LABEL, CAMERA_FRAME_UPDATED, CAMERA_STATUS_UPDATED, CLEAR_DATASET, DELETE_EXAMPLE, KEYPOINTS_ESTIMATED, SET_DATASET, UPDATE_LABEL} from '../constants';
import {CamerasStatus} from '../serverApi';
import {Activities, CameraActivities, CameraClassifications, CameraClassifiers, CameraDatasets, CameraFrames, CameraKeypoints} from '../types';
import {addKeypointsToDataset, deleteExample, setClassifiersExamples, updateClassExamples} from '../util';

export type State = {
  readonly cameraDatasets: CameraDatasets,
  readonly cameraKeypoints: CameraKeypoints,
  readonly posenetModel?: PoseNet,
  readonly cameraClassifiers: CameraClassifiers,
  readonly cameras: CamerasStatus,
  // readonly cameraFrames: CameraFrameType[],
  readonly activities: CameraActivities,
  readonly frames: CameraFrames,
  readonly classifications: CameraClassifications
};

const initialState: State = {
  cameraDatasets: {},
  cameraClassifiers: {},
  cameras: {},
  frames: {},
  classifications: {},
  activities: {},
  cameraKeypoints: []
};

const max = (values: number[]) =>
    values.reduce((result, value) => Math.max(value, result), 0);

const nextActivityId = (activities: Activities) =>
    max(Object.keys(activities).map(x => +x)) + 1;

const addLabel = (activities: Activities = {}, text: string) => {
  return {...activities, [nextActivityId(activities)]: text};
};

const updateLabel = (activities: Activities = {}, id: number, text: string) => {
  return {...activities, [id]: text};
};

type ActivityActions = ActionType<typeof actions>;

const activityReducer = (state = initialState, action: ActivityActions):
    State => {
      const {cameraKeypoints, cameraDatasets, activities} = state;
      let newDataset;

      console.log('state action', state, action);

      switch (action.type) {
        case ADD_EXAMPLE:
          if (!cameraKeypoints) return state;

          var {cameraId, classId} = action.payload;

          const keypoints = cameraKeypoints[cameraId];
          if (!keypoints) return state;

          newDataset = addKeypointsToDataset(
              keypoints, cameraDatasets[cameraId], classId);

          // a wierd situation since we have a mutable classifier.
          updateClassExamples(
              state.cameraClassifiers[cameraId], newDataset, classId);

          return {
            ...state,
                cameraDatasets: {...cameraDatasets, [cameraId]: newDataset}
          }
        case DELETE_EXAMPLE:
          var {cameraId, classId} = action.payload;
          newDataset = deleteExample(
              cameraDatasets[cameraId], classId, action.payload.example)

          // a wierd situation since we have a mutable classifier.
          updateClassExamples(
              state.cameraClassifiers[cameraId], newDataset, classId);

          return {
            ...state,
            cameraDatasets: {
              ...cameraDatasets,
              [cameraId]: newDataset,
            }
          };
        case SET_DATASET:
          return {
            ...state,
            cameras: action.payload.camerasState,
            cameraDatasets: action.payload.dataset,
            activities: action.payload.activities,
            cameraClassifiers: setClassifiersExamples(
                action.payload.camerasState, state.cameraClassifiers,
                action.payload.dataset)
          };
        case CLEAR_DATASET:
          newDataset = {...cameraDatasets};
          delete newDataset[action.payload.cameraId];

          state.cameraClassifiers[action.payload.cameraId].clearAllClasses();

          return {...state, cameraDatasets: newDataset};
        case ADD_LABEL:
          var {cameraId, text} = action.payload;

          const newCameraActivities = addLabel(activities[cameraId], text);
          return {
            ...state,
            activities: {...state.activities, [cameraId]: newCameraActivities}
          };
        case UPDATE_LABEL:
          const updatedCameraActivities = updateLabel(
              activities[action.payload.cameraId], action.payload.id,
              action.payload.text);
          return {
            ...state,
            activities: {
              ...activities,
              [action.payload.cameraId]: updatedCameraActivities
            }
          };
        case KEYPOINTS_ESTIMATED:
          return {
            ...state,
            cameraKeypoints:
                {...state.cameraKeypoints, ...action.payload.keypoints}
          };
        case CAMERA_STATUS_UPDATED:
          return {...state, cameras: action.payload};
        case CAMERA_FRAME_UPDATED:
          return {
            ...state,
            frames: {
              ...state.frames,
              [action.payload.cameraId]:
                  {frame: action.payload.frame, updateTime: action.payload.time}
            }
          };
        case ACTIVITY_CLASSIFIED:
          return {
            ...state, classifications: {
              ...state.classifications,
              [action.payload.cameraId]: action.payload.classification
            }
          }
        default:
          return state;
      }
    }

export type RootState = StateType<typeof activityReducer>;

export default activityReducer;
