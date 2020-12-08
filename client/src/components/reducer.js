import { initialState } from './store';

export default function reducer(state, action) {
  const setAttr = (attr) => {
    return {
      ...state,
      [attr]: action.payload
    };
  };

  const resetAttr = (attr) => {
    return {
      ...state,
      [attr]: initialState[attr]
    };
  };

  switch(action.type) {
    case 'SET_USER':
      return setAttr('user');
    case 'RESET_USER':
      return resetAttr('user');
    default:
      return state;
  }
}
