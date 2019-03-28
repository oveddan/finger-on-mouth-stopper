import { DatasetObject, Keypoints } from "./types";
import { ActionTypes, EXAMPLE_ADDED, KEYPOINTS_ESTIMATED } from "./actions";
import { addKeypointsToDataset } from "./util";
import { combineReducers } from 'redux'
import { State } from "./state";

const dataset = (state: DatasetObject = {}, action: ActionTypes): DatasetObject => {
  switch(action.type) {
    case EXAMPLE_ADDED:
      return addKeypointsToDataset(action.keypoints, state, action.clasId);
    default:
      return state;
  }
}

const keypoints = (state: (Keypoints | null) = null, action: ActionTypes) => {
  switch(action.type) {
    case KEYPOINTS_ESTIMATED:
       return action.keypoints;
    default:
      return state;
  }
}

const reducers = combineReducers<State, ActionTypes>({
  dataset,
  keypoints
});

export default reducers;