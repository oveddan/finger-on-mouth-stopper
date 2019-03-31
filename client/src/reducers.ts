import {KNNClassifier} from '@tensorflow-models/knn-classifier';
import {action, ActionType, StateType} from 'typesafe-actions';

import * as actions from './actions';
import {ADD_EXAMPLE, ADD_LABEL, CLEAR_DATASET, DELETE_EXAMPLE, KEYPOINTS_ESTIMATED, SET_DATASET, UPDATE_LABEL} from './constants';
import {CameraClassifiers, DatasetObject, Keypoints, Labels} from './types';
import {addKeypointsToDataset, deleteExample, setClassifiersExamples, updateClassExamples} from './util';

export type State = {
  readonly cameraDatasets: {
    [cameraId: number]: DatasetObject,
  },
  readonly cameraClassifiers: CameraClassifiers,
  readonly cameras: string[],
  readonly activities: Labels,
  readonly cameraKeypoints: {
    [cameraId: number]: Keypoints
  }
};

const defaultActivities = [
  'at desk', 'on yoga matt', 'on phone in bed', 'in bed', 'eating',
  'doing dishes', 'meditating'
];

const defaultCameras = ['Bedroom', 'Kitchen'];

const initialState: State = {
  cameraDatasets: {},
  cameraClassifiers: {},
  cameras: defaultCameras,
  activities: defaultActivities.reduce(
      (result: {[id: number]: string}, activity, id):
          {[id: number]: string} => {
            result[id] = activity;
            return result;
          },
      {}),
  cameraKeypoints: []
};

export type Actions = ActionType<typeof actions>;

export type RootAction = ActionType<typeof actions>;

const max = (values: number[]) =>
    values.reduce((result, value) => Math.max(value, result), 0);

const nextActivityId = (activities: Labels) =>
    max(Object.keys(activities).map(x => +x)) + 1;

const reducer = (state = initialState, action: Actions):
    State => {
      const {cameraKeypoints, cameraDatasets, activities} = state;
      let newDataset;

      console.log('state action', state, action);

      switch (action.type) {
        case ADD_EXAMPLE:
          if (!cameraKeypoints) return state;
          var {cameraId, classId} = action.payload;

          newDataset = addKeypointsToDataset(
              cameraKeypoints[cameraId], cameraDatasets[cameraId], classId);

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
            ...state, cameraDatasets: {
              ...cameraDatasets,
              [cameraId]: newDataset,
            }
          }
        case SET_DATASET:

          return {
            ...state, cameraDatasets: action.payload.dataset,
                activities: action.payload.activities,
                cameraClassifiers: setClassifiersExamples(
                    state.cameras, state.cameraClassifiers,
                    action.payload.dataset)
          }
        case CLEAR_DATASET:
          newDataset = {...cameraDatasets};
          delete newDataset[action.payload];

          state.cameraClassifiers[action.payload].clearAllClasses();

          return {
            ...state, cameraDatasets: newDataset
          }
        case ADD_LABEL:
          const newId = nextActivityId(activities);
          return {
            ...state, activities: {...activities, [newId]: action.payload}
          }
        case UPDATE_LABEL:
          return {
            ...state,
            activities:
                {...activities, [action.payload.id]: action.payload.text}
          };
        case KEYPOINTS_ESTIMATED:
          var {cameraId, keypoints} = action.payload;
          return {
            ...state,
                cameraKeypoints:
                    {...state.cameraKeypoints, [cameraId]: keypoints}
          }

        default:
          return state;
      }
    }

export type RootState = StateType<typeof reducer>;

export default reducer;
