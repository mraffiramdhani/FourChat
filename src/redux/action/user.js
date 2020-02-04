export const setUser = data => {
  return {
    type: 'SET_USER',
    data,
  }
}

export const setPhoto = photo => {
  return {
    type: 'SET_PHOTO',
    photo,
  }
}