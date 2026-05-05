import { createMachine, assign } from 'xstate';

export const queueMachine = createMachine({
  id: 'queue',
  initial: 'idle',
  // Указываем типы прямо в контексте через 'as'
  context: {
    position: null as number | null,
    totalInQueue: 3 as number,
    error: null as string | null
  },
  states: {
    idle: { 
      on: { JOIN: 'joining' } 
    },
    joining: {
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
            position: ({ context }: any) => {
              // Добавляем проверку на null, чтобы Math.max не ругался
              return context.position !== null ? Math.max(1, context.position - 1) : null;
            }
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