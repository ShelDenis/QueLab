import { createMachine, assign } from 'xstate';

// 1. Описываем типы для контекста и событий (для TS это важно)
interface AuthContext {
  email: string;
  password: string;
  error: string | null;
}

type AuthEvent = 
  | { type: 'UPDATE_FIELDS'; email: string; password: string }
  | { type: 'SUBMIT' }
  | { type: 'SUCCESS' }
  | { type: 'FAILURE'; error: string }
  | { type: 'RETRY' };

// 2. Создаем машину с указанием этих типов
export const authMachine = createMachine({
  id: 'auth',
  initial: 'idle',
  context: {
    email: '',
    password: '',
    error: null
  } as AuthContext, // Подсказываем начальный тип контекста
  types: {} as {
    context: AuthContext;
    events: AuthEvent;
  },
  states: {
    idle: {
      on: { 
        UPDATE_FIELDS: {
          actions: assign(({ event }) => {
            // Теперь TS точно знает, что у UPDATE_FIELDS есть email и password
            return {
              email: event.email,
              password: event.password
            };
          })
        },
        SUBMIT: 'loading' 
      }
    },
    loading: {
      on: {
        SUCCESS: 'authenticated',
        FAILURE: {
          target: 'error',
          actions: assign({
            error: ({ event }) => event.error
          })
        }
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