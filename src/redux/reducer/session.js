const initialState = {
  restoring: false,
  loading: false,
  user: null,
  error: null
}

const session = (state = initialState, action) => {
  switch (action.type) {
    case 'SESSION_RESTORING':
      return { ...state, restoring: true }
    case 'SESSION_LOADING':
      return { ...state, restoring: false, loading: true, error: null }
    case 'SESSION_SUCCESS':
      return { restoring: false, loading: false, user: action.user, error: null }
    case 'SESSION_ERROR':
      return { restoring: false, loading: false, user: null, error: action.error }
    case 'SESSION_LOGOUT':
      return initialState
    default:
      return state
  }
}

export default session