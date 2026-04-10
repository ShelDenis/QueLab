import { createMachine } from 'xstate';

export const onlineMachine = createMachine({
  id: 'onlineStatus',
  initial: 'online',
  states: {
    online: {
      on: { OFFLINE: 'offline' }
    },
    offline: {
      on: { ONLINE: 'online' }
    }
  }
});