import { appActionTypes } from '../actions/appActions';
import { EditorState } from 'draft-js';

const editorState = EditorState.createEmpty();
console.log(editorState)
const INITIAL_STATE = {
  init: false
}


function setState(state, newState) {
    console.log(JSON.stringify({ ...state, ...newState }));
    return { ...state, ...newState };
}

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case appActionTypes.INIT:
          return setState(state, action.state);
        case appActionTypes.CHANGE_STATE:
          return setState(state, action.state);
    }
    return state;
};