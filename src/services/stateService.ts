// src/services/stateService.ts
import { ref, readonly } from 'nativescript-vue';
import { createActor } from 'xstate';
import { onlineMachine } from '../machines/onlineMachine';
import { queueMachine } from '../machines/queueMachine';
import { authMachine } from '../machines/authMachine';
import { api } from './api';
import * as appSettings from '@nativescript/core/application-settings';

// Создаём и запускаем актёров
const onlineActor = createActor(onlineMachine).start();
const queueActor = createActor(queueMachine).start();
const authActor = createActor(authMachine).start();

const onlineState = ref(onlineActor.getSnapshot());
const queueState = ref(queueActor.getSnapshot());
const authState = ref(authActor.getSnapshot());

onlineActor.subscribe((snapshot) => { onlineState.value = snapshot; });
queueActor.subscribe((snapshot) => { queueState.value = snapshot; });
authActor.subscribe((snapshot) => { authState.value = snapshot; });

// ✅ ЛОГИКА ВОССТАНОВЛЕНИЯ СЕССИИ (исправленный синтаксис)
(async () => {
  const savedToken = appSettings.getString('auth_token');

if (savedToken) {
  console.log('🔑 Токен найден, восстанавливаю сессию...');
  console.log('📊 Состояние машины ДО RESTORE:', authActor.getSnapshot().value);

  try {
    const profile = await api.getProfile(savedToken);
    console.log('✅ Профиль загружен:', profile.user_name);

    authActor.send({
      type: 'RESTORE',
      data: {
        token: savedToken,
        userId: profile.user_id,
        userName: profile.user_name,
        email: profile.email,
        // ✅ Исправлено: avatar_url (из интерфейса) + ?? null для безопасности
        avatarUrl: profile.avatar_url ?? null
      }
    });

    // ✅ Проверяем состояние ПОСЛЕ отправки события
    setTimeout(() => {
      console.log('📊 Состояние машины ПОСЛЕ RESTORE:', authActor.getSnapshot().value);
      console.log('📦 Контекст после RESTORE:', authActor.getSnapshot().context);
    }, 100);

  } catch (e: any) {
    console.warn('⚠️ Ошибка восстановления:', e.message);
    appSettings.remove('auth_token');
    authActor.send({ type: 'LOGOUT' });
  }
}
})();

// ✅ Подписка: сохраняем ТОЛЬКО токен
authActor.subscribe((snapshot) => {
  authState.value = snapshot;

  if (snapshot.context.token) {
    appSettings.setString('auth_token', snapshot.context.token);
  } else {
    appSettings.remove('auth_token');
  }
});

export function useGlobalState() {
  return {
    online: {
      state: readonly(onlineState),
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

export function stopAllActors() {
  onlineActor.stop();
  queueActor.stop();
  authActor.stop();
}