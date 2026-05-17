// src/machines/authMachine.ts
import { createMachine, assign } from 'xstate';

// 1. Контекст
export interface AuthContext {
  email: string;
  password: string;
  error: string | null;
  token: string | null;
  userId: number | null;
  userName: string | null;
  avatarUrl: string | null;
}

// 2. События — ✅ ПРАВИЛЬНЫЙ СИНТАКСИС
// Ключевое исправление: data: { ... } вместо просто { ... }
export type AuthEvent =
  | { type: 'UPDATE_FIELDS'; email: string; password: string }
  | { type: 'SUBMIT' }
  | {
      type: 'SUCCESS';
      data: {  // ← Обязательно указываем ключ 'data'
        token: string;
        userId: number;
        userName: string;
      }
    }
  | { type: 'FAILURE'; error: string }
  | { type: 'RETRY' }
  | { type: 'LOGOUT' } // ← Для будущего выхода из системы
  | { type: 'UPDATE_AVATAR';  data: { avatarUrl: string | null } }
  | { type: 'RESTORE';  data: { token: string; userId: number; userName: string; email: string; avatarUrl: string | null } };

// 3. Создаём машину
export const authMachine = createMachine({
  id: 'auth',
  initial: 'idle',
  context: {
    email: '',
    password: '',
    error: null,
    token: null,
    userId: null,
    userName: null,
    avatarUrl: null as string | null,
  } satisfies AuthContext, // ✅ Используем satisfies для типизации контекста
  types: {} as {
    context: AuthContext;
    events: AuthEvent;
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
        RESTORE: {
          target: 'authenticated',
          actions: assign(({ event }) => ({
            token: event.data.token,
            userId: event.data.userId,
            userName: event.data.userName,
            email: event.data.email,
            avatarUrl: event.data.avatarUrl, // ← Аватар из БД
            error: null
          }))
        },
        SUBMIT: 'loading',
        LOGOUT: { actions: assign(() => ({
          email: '',
          password: '',
          token: null,
          userId: null,
          userName: null,
          error: null
        })) }
      }
    },
    loading: {
      on: {
        // ✅ SUCCESS: сохраняем данные из event.data
        SUCCESS: {
          target: 'authenticated',
          actions: assign(({ event }) => ({
            token: event.data.token,
            userId: event.data.userId,
            userName: event.data.userName,
            error: null
          }))
        },
        // ✅ FAILURE: сохраняем ошибку
        FAILURE: {
          target: 'error',
          actions: assign(({ event }) => ({
            error: event.error
          }))
        }
      }
    },
    // ✅ Убрали type: 'final' — актёр остаётся живым
    authenticated: {
      on: {
        LOGOUT: {
          target: 'idle',
          actions: assign(() => ({
            email: '',
            password: '',
            token: null,
            userId: null,
            userName: null,
            error: null
          })),
        },
        UPDATE_AVATAR: {
          actions: assign(({ event }) => ({
            avatarUrl: (event as any).data.avatarUrl
          }))
        } as any,
      }
    },
    error: {
      on: {
        RETRY: 'idle',
        LOGOUT: 'idle'
      }
    }
  }
});