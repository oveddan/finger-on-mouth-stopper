import { Keypoints } from "./types";
import { State } from "./state";
import { Dispatch } from "redux";
import { ThunkAction, ThunkDispatch} from 'redux-thunk';

export const EXAMPLE_ADDED = 'EXAMPLE_ADDED'
export const KEYPOINTS_ESTIMATED = 'KEYPOINTS_ESTIMATED'

interface ExampleAddedAction {
  type: typeof EXAMPLE_ADDED,
  clasId: number ,
  keypoints: Keypoints
}

interface KeypointsEstimatedAction {
  type: typeof KEYPOINTS_ESTIMATED,
  keypoints: Keypoints
}

export const exampleAdded = (classId: number, keypoints: Keypoints) => ({
  classId,
  type: EXAMPLE_ADDED,
  keypoints
});

export const keypointsEstimated = (keypoints: Keypoints) => ({
  type: KEYPOINTS_ESTIMATED,
  keypoints
});

export type Actions = ExampleAddedAction | KeypointsEstimatedAction;
