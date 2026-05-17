// src/machines/queueMachine.ts
import { createMachine, assign } from 'xstate';

export interface QueueContext {
  name: string;
  description: string;
  imageUri: string | null;
  imageBase64: string | null;
  error: string | null;
  createdQueueId: number | null;
}

export type QueueEvent =
  | { type: 'UPDATE_NAME'; name: string }
  | { type: 'UPDATE_DESCRIPTION'; description: string }
  | { type: 'SET_IMAGE'; data: { uri: string; base64: string } }
  | { type: 'CLEAR_IMAGE' }
  | { type: 'SUBMIT' }
  | { type: 'SUCCESS'; data: { queueId: number } }
  | { type: 'FAILURE'; error: string }
  | { type: 'RESET' };

export const queueMachine = createMachine({
  id: 'queue',
  initial: 'idle',

  context: {
    name: '',
    description: '',
    imageUri: null,
    imageBase64: null,
    error: null,
    createdQueueId: null
  },

  // ✅ ГЛОБАЛЬНЫЕ СОБЫТИЯ (на корневом уровне) — ТОЧКА обязательна!
  on: {
    RESET: {
      target: '.idle',  // ← Точка, потому что это переход из корня в дочернее состояние
      actions: assign(() => ({
        name: '',
        description: '',
        imageUri: null,
        imageBase64: null,
        error: null,
        createdQueueId: null
      }))
    }
  },

  states: {
    idle: {
      on: {
        // ✅ Локальные переходы — БЕЗ точки (соседние состояния)
        UPDATE_NAME: {
          actions: assign(({ event }) => ({ name: event.name }))
        },
        UPDATE_DESCRIPTION: {
          actions: assign(({ event }) => ({ description: event.description }))
        },
        SET_IMAGE: {
          actions: assign(({ event }) => ({
            imageUri: event.data.uri,
            imageBase64: event.data.base64
          }))
        },
        CLEAR_IMAGE: {
          actions: assign(() => ({
            imageUri: null,
            imageBase64: null
          }))
        },
        SUBMIT: 'creating'  // ← Без точки: переход к соседу
      }
    },

    creating: {
      on: {
        SUCCESS: {
          target: 'created',  // ← ✅ БЕЗ точки! 'created' — сосед 'creating'
          actions: assign(({ event }) => ({
            createdQueueId: event.data.queueId,
            error: null
          }))
        },
        FAILURE: {
          target: 'error',  // ← ✅ БЕЗ точки!
          actions: assign(({ event }) => ({ error: event.error }))
        }
      }
    },

    created: {
      // Машина остаётся здесь, пока не придёт глобальный RESET
    },

    error: {
      on: {
        SUBMIT: 'creating'  // ← Без точки
      }
    }
  }
});