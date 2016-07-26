
export const appActionTypes = {
  INIT: 'INIT',
  CHANGE_STATE: 'CHANGE_STATE'
}

export const init = _ => {
        return {
          type: appActionTypes.INIT,
          state: {
            init: true
          }
        }
};

export const changeState = editorState => {
  return {
    type: appActionTypes.CHANGE_STATE,
    state: {
      editorState
    }
  }
}
