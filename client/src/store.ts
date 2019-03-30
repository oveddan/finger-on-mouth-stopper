import {createStore} from 'redux';
import {StateType} from 'typesafe-actions';

import reducers from './reducers';

const store = createStore(reducers);

export type Store = StateType<typeof store>;

export default store;
