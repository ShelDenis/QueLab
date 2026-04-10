import { createMachine } from 'xstate';

// 1. Определяем типы событий
// Здесь контекст не нужен (он пустой), поэтому описываем только события
type OnlineEvent = 
  | { type: 'OFFLINE' }
  | { type: 'ONLINE' };

export const onlineMachine = createMachine({
  id: 'onlineStatus',
  initial: 'online',
  // 2. Привязываем типы для строгой проверки
  types: {} as {
    events: OnlineEvent;
  },
  states: {
    online: {
      on: { 
        OFFLINE: { target: 'offline' } 
      }
    },
    offline: {
      on: { 
        ONLINE: { target: 'online' } 
      }
    }
  }
});