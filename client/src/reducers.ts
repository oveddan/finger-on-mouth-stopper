import {action, ActionType, StateType} from 'typesafe-actions';

import * as actions from './actions';
import {ADD_EXAMPLE, ADD_LABEL, CLEAR_DATASET, DELETE_EXAMPLE, KEYPOINTS_ESTIMATED, SET_DATASET, UPDATE_LABEL} from './constants';
import {Activities, DatasetObject, Keypoints} from './types';
import {addKeypointsToDataset, deleteExample} from './util';

export type State = {
  readonly dataset: DatasetObject,
  readonly activities: Activities,
  readonly keypoints?: Keypoints
};

const initialState: State = {
  dataset: {},
  activities: {},
};

export type Actions = ActionType<typeof actions>;

export type RootAction = ActionType<typeof actions>;

const max = (values: number[]) =>
    values.reduce((result, value) => Math.max(value, result), 0);

const nextActivityId = (activities: Activities) =>
    max(Object.keys(activities).map(x => +x));

const reducer = (state = initialState, action: Actions):
    State => {
      const {keypoints, dataset, activities} = state;

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
                activities: action.payload.activities
          }
        case CLEAR_DATASET:
          return {
            ...state, dataset: {}
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
          return {...state, keypoints: action.payload};

        default:
          return state;
      }
    }

export type RootState = StateType<typeof reducer>;

export default reducer;
