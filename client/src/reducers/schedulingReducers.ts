import * as moment from 'moment'
import {ActionType} from 'typesafe-actions';

import * as actions from '../actions/schedulingActions';
import {SCHEDULE_CLEARED, SCHEDULE_CREATED, TIME_ADVANCED} from '../constants';
import {Schedule} from '../types';

export type State = {
  readonly schedule?: Schedule, readonly currentTime: moment.Moment
};

const initialState = {
  currentTime: moment.default()
};

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
        case TIME_ADVANCED:
          return {...state, currentTime: action.payload.time};
        default:
          return state;
      }
    };

export default schedulingReducer;
