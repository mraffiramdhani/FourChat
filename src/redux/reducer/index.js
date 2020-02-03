import { combineReducers } from 'redux';

import chat from './chat';
import session from './session';

const appReducer = combineReducers({
  chat,
  session
});

export default appReducer;