import {action, ActionType, StateType} from 'typesafe-actions';

import * as actions from './actions';
import {ADD_EXAMPLE, ADD_LABEL, CLEAR_DATASET, DELETE_EXAMPLE, KEYPOINTS_ESTIMATED, SET_DATASET, UPDATE_LABEL} from './constants';
import {DatasetObject, Keypoints, Labels} from './types';
import {addKeypointsToDataset, deleteExample} from './util';

export type State = {
  readonly dataset: DatasetObject,
  readonly labels: Labels,
  readonly keypoints?: Keypoints
};

const initialState: State = {
  dataset: {},
  labels: {},
};

export type Actions = ActionType<typeof actions>;

export type RootAction = ActionType<typeof actions>;

const max = (values: number[]) =>
    values.reduce((result, value) => Math.max(value, result), 0);

const nextActivityId = (activities: Labels) =>
    max(Object.keys(activities).map(x => +x)) + 1;

const reducer = (state = initialState, action: Actions):
    State => {
      const {keypoints, dataset, labels} = state;

      switch (action.type) {
        case ADD_EXAMPLE:
          if (!keypoints) return state;
          return {
            ...state,
                dataset:
                    addKeypointsToDataset(keypoints, dataset, action.payload)
          }
        case DELETE_EXAMPLE:
          return {
            ...state,
                dataset: deleteExample(
                    dataset, action.payload.classId, action.payload.example)
          }
        case SET_DATASET:
          return {
            ...state, dataset: action.payload.dataset,
                labels: action.payload.activities
          }
        case CLEAR_DATASET:
          return {
            ...state, dataset: {}
          }
        case ADD_LABEL:
          const newId = nextActivityId(labels);
          return {
            ...state, labels: {...labels, [newId]: action.payload}
          }
        case UPDATE_LABEL:
          return {
            ...state,
            labels: {...labels, [action.payload.id]: action.payload.text}
          };
        case KEYPOINTS_ESTIMATED:
          return {...state, keypoints: action.payload};

        default:
          return state;
      }
    }

export type RootState = StateType<typeof reducer>;

export default reducer;
