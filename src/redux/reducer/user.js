const initialState = {
  data: [],
  photo: null,
}

const user = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        data: action.data
      }
    case 'SET_PHOTO':
      return {
        ...state,
        photo: action.photo
      }
    default:
      return state
  }
}

export default user
