import { useMachine } from '@xstate/vue';
import { onlineMachine } from '../machines/onlineMachine';
import { queueMachine } from '../machines/queueMachine';
import { authMachine } from '../machines/authMachine';

// Запускаем машины глобально
const onlineService = useMachine(onlineMachine);
const queueService = useMachine(queueMachine);
const authService = useMachine(authMachine);

export function useGlobalState() {
  return {
    online: onlineService,
    queue: queueService,
    auth: authService
  };
}