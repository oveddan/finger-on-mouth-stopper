import {ActionType} from 'typesafe-actions';

import * as actions from '../actions/schedulingActions';
import {SCHEDULE_CLEARED, SCHEDULE_CREATED} from '../constants';
import {Schedule} from '../types';

export type State = {
  readonly schedule?: Schedule
}

const initialState = {};

type SchedulingActions = ActionType<typeof actions>;

const schedulingReducer =
    (state = initialState, action: SchedulingActions): State => {
      switch (action.type) {
        case SCHEDULE_CREATED:
          return {
            ...state, schedule: action.payload
          }
        case SCHEDULE_CLEARED:
          return {
            ...state, schedule: undefined
          }
        default:
          return state;
      }
    };

export default schedulingReducer;
