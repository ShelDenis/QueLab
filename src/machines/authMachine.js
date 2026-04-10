// authMachine.ts
import { createMachine, assign } from 'xstate';

export const authMachine = createMachine({
  id: 'auth',
  initial: 'idle',
  context: {
    email: '',
    password: '',
    error: null
  },
  states: {
    idle: {
      on: { 
        UPDATE_FIELDS: {
          actions: assign(({ event }) => ({
            email: event.email,
            password: event.password
          }))
        },
        SUBMIT: 'loading' 
      }
    },
    loading: {
      on: {
        SUCCESS: 'authenticated',
        FAILURE: 'error'
      }
    },
    authenticated: {
      type: 'final'
    },
    error: {
      on: { RETRY: 'idle' }
    }
  }
});