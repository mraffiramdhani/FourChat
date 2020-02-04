const initialState = {
  data: [],
}

const user = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, data: action.data}
    default:
      return state
  }
}

export default user
