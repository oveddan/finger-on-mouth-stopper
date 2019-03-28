
import reducers from './reducers';
import { applyMiddleware, createStore } from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import { State } from './state';
import { Actions } from './actions';

const store = createStore(reducers);

export default store;
