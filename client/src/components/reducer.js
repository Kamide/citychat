import { initialState } from './store';

export default function reducer(state, action) {
  switch(action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload
      };
    case 'RESET_USER':
      return {
        ...state,
        user: initialState.user
      };
    default:
      return state;
  }
}
