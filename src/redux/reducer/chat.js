const initialState = {
  sending: false,
  sendingError: null,
  message: '',
  messages: {},
  loadMessagesError: null
}

const chat = (state = initialState, action) => {
  switch (action.type) {
    case 'CHAT_MESSAGE_LOADING':
      return { ...state, sending: true, sendingError: null }
    case 'CHAT_MESSAGE_ERROR':
      return { ...state, sending: false, sendingError: action.error }
    case 'CHAT_MESSAGE_SUCCESS':
      return { ...state, sending: false, sendingError: null, message: '' }
    case 'CHAT_MESSAGE_UPDATE':
      return { ...state, sending: false, message: action.text, sendingError: null }
    case 'CHAT_LOAD_MESSAGES_SUCCESS':
      return { ...state, messages: action.messages, loadMessagesError: null }
    case 'CHAT_LOAD_MESSAGES_ERROR':
      return { ...state, messages: null, loadMessagesError: action.error }
    default:
      return state
  }
}

export default chat
