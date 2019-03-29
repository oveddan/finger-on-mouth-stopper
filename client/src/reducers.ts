import {ActionTypes, ADD_EXAMPLE, ADD_LABEL, CLEAR_DATASET, DELETE_EXAMPLE, KEYPOINTS_ESTIMATED, SET_DATASET, UPDATE_LABEL} from './actions';
import {State} from './types';
import {addKeypointsToDataset, deleteExample} from './util';

const initialState: State = {
  dataset: {},
  labels: [],
};

const reducer = (state = initialState, action: ActionTypes):
    State => {
      const {keypoints, dataset, labels} = state;

      switch (action.type) {
        case ADD_EXAMPLE:
          if (!keypoints) return state;
          return {
            ...state,
                dataset:
                    addKeypointsToDataset(keypoints, dataset, action.classId)
          }
        case DELETE_EXAMPLE:
          return {
            ...state,
                dataset: deleteExample(dataset, action.classId, action.example)
          }
        case SET_DATASET:
          return {
            ...state, dataset: action.dataset, labels: action.labels
          }
        case CLEAR_DATASET:
          return {
            ...state, dataset: {}, labels: []
          }
        case ADD_LABEL:
          const newLabels = labels.slice(0);
          newLabels.push(action.text);
          return {
            ...state, labels: newLabels
          }
        case UPDATE_LABEL:
          const newLabelsB = labels.slice(0);
          newLabelsB[action.id] = action.text;
          return {...state, labels: newLabelsB};
        case KEYPOINTS_ESTIMATED:
          return {...state, keypoints: action.keypoints};

        default:
          return state;
      }
    }

export default reducer;
