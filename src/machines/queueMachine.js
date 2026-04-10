import { createMachine, assign } from 'xstate';

export const queueMachine = createMachine({
  id: 'queue',
  initial: 'idle',
  context: {
    position: null,
    totalInQueue: 3,
    error: null
  },
  states: {
    idle: { 
      on: { JOIN: 'joining' } 
    },
    joining: {
      // Имитация запроса к API
      on: {
        SUCCESS: {
          target: 'waiting',
          actions: assign({ position: 4, totalInQueue: 4 })
        },
        FAILURE: 'idle'
      }
    },
    waiting: {
      on: {
        MOVE_UP: {
          actions: assign({ 
            position: ({ context }) => Math.max(1, context.position - 1) 
          })
        },
        YOUR_TURN: 'active',
        LEAVE: 'idle'
      }
    },
    active: {
      on: { FINISH: 'idle' }
    }
  }
});