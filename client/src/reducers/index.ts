import {combineReducers} from 'redux';
import activityReducer, {State as ActivitiesState} from './activityReducers';
import schedulingReducer, {State as SchedulingState} from './schedulingReducers';

export type State = {
  activities: ActivitiesState,
  scheduling: SchedulingState
};

export default combineReducers(
    {activities: activityReducer, scheduling: schedulingReducer})
