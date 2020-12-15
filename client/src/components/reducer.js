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

  const setRelAttr = (attr) => {
    return {
      ...state,
      relationships: {
        ...state.relationships,
        [attr]: action.payload
      }
    };
  };

  const resetRelAttr = (attr) => {
    return {
      ...state,
      relationships: {
        ...state.relationships,
        [attr]: initialState.relationships[attr]
      }
    };
  };

  switch(action.type) {
    case 'SET_USER':
      return setAttr('user');
    case 'RESET_USER':
      return resetAttr('user');

    case 'SET_RELATIONSHIPS':
      return setAttr('relationships')
    case 'RESET_RELATIONSHIPS':
        return resetAttr('user');

    case 'SET_FRIENDS':
      return setRelAttr('friends')
    case 'RESET_FRIENDS':
      return resetRelAttr('friends')

    case 'SET_REQUESTS':
      return setRelAttr('requests')
    case 'RESET_REQUESTS':
      return resetRelAttr('requests')

    case 'ADD_FRIEND':
      return {
        ...state,
        relationships: {
          ...state.relationships,
          friends: state.relationships.friends.concat([action.payload])
        }
      };
    case 'REMOVE_FRIEND': {
      const index = state.relationships.friends.findIndex(user => String(user.id) === String(action.payload.id));
      if (index < 0) {
        return state;
      }
      return {
        ...state,
        relationships: {
          ...state.relationships,
          friends: [
            ...state.relationships.friends.slice(0, index),
            ...state.relationships.friends.slice(index + 1)
          ]
        }
      };
    }

    case 'ADD_INCOMING_REQUEST':
      return {
        ...state,
        relationships: {
          ...state.relationships,
          requests: {
            ...state.relationships.requests,
            incoming: state.relationships.requests.incoming.concat([action.payload])
          }
        }
      };
    case 'REMOVE_INCOMING_REQUEST': {
      const index = state.relationships.requests.incoming.findIndex(user => String(user.id) === String(action.payload.id));
      return {
        ...state,
        relationships: {
          ...state.relationships,
          requests: {
            ...state.relationships.requests,
            incoming: [
              ...state.relationships.requests.incoming.slice(0, index),
              ...state.relationships.requests.incoming.slice(index + 1)
            ]
          }
        }
      };
    }

    case 'ADD_OUTGOING_REQUEST':
      return {
        ...state,
        relationships: {
          ...state.relationships,
          requests: {
            ...state.relationships.requests,
            outgoing: state.relationships.requests.outgoing.concat([action.payload])
          }
        }
      };
    case 'REMOVE_OUTGOING_REQUEST': {
      const index = state.relationships.requests.outgoing.findIndex(user => String(user.id) === String(action.payload.id));
      return {
        ...state,
        relationships: {
          ...state.relationships,
          requests: {
            ...state.relationships.requests,
            outgoing: [
              ...state.relationships.requests.outgoing.slice(0, index),
              ...state.relationships.requests.outgoing.slice(index + 1)
            ]
          }
        }
      };
    }

    case 'RESET_ALL':
      return initialState

    default:
      return state;
  }
}
