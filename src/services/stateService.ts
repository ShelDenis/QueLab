// src/services/stateService.ts
import { ref, readonly } from 'nativescript-vue';
import { createActor } from 'xstate'; // ← чистый xstate, без @xstate/vue
import { onlineMachine } from '../machines/onlineMachine';
import { queueMachine } from '../machines/queueMachine';
import { authMachine } from '../machines/authMachine';

// Создаём и запускаем актёров ОДИН раз при загрузке модуля
const onlineActor = createActor(onlineMachine).start();
const queueActor = createActor(queueMachine).start();
const authActor = createActor(authMachine).start();

// Реактивные хранилища для снимков состояния
const onlineState = ref(onlineActor.getSnapshot());
const queueState = ref(queueActor.getSnapshot());
const authState = ref(authActor.getSnapshot());

// Подписываемся на изменения и обновляем Ref
onlineActor.subscribe((snapshot) => { onlineState.value = snapshot; });
queueActor.subscribe((snapshot) => { queueState.value = snapshot; });
authActor.subscribe((snapshot) => { authState.value = snapshot; });

export function useGlobalState() {
  return {
    online: {
      state: readonly(onlineState), // защищаем от прямой модификации
      send: (event: any) => onlineActor.send(event)
    },
    queue: {
      state: readonly(queueState),
      send: (event: any) => queueActor.send(event)
    },
    auth: {
      state: readonly(authState),
      send: (event: any) => authActor.send(event)
    }
  };
}

// Опционально: остановка актёров при выходе из приложения
export function stopAllActors() {
  onlineActor.stop();
  queueActor.stop();
  authActor.stop();
}