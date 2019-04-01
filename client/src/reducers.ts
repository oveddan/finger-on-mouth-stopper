import {combineReducers} from 'redux';
import activityReducer, {State as ActivitiesState} from './activityReducers';

export type State = {
  activities: ActivitiesState
};

export default combineReducers({activities: activityReducer})
