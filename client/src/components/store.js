import { createContext, useReducer } from 'react';

import reducer from './reducer';

export const initialState = {
  user: {
    id: undefined,
    name: 'CityChat User'
  },
  relationships: {
    friends: [],
    requests: {
      incoming: [],
      outgoing: []
    }
  }
};

export const StoreContext = createContext(initialState);

export function StoreProvider({children}) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StoreContext.Provider value={[state, dispatch]}>
      {children}
    </StoreContext.Provider>
  );
}
