<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'; // ← Из 'vue'
import { $navigateTo, alert } from 'nativescript-vue'; // ← Навигация отсюда
// ✅ ДОБАВЛЕНЫ ОТСУТСТВУЮЩИЕ ИМПОРТЫ:
import { prompt as dialogPrompt, alert as dialogAlert } from '@nativescript/core/ui/dialogs';
import * as appSettings from '@nativescript/core/application-settings'; // ← КРИТИЧНО!
import { api } from '../services/api'; // ← КРИТИЧНО!
import { useGlobalState } from '../services/stateService';

import Details from './Details.vue';
import Profile from './Profile.vue';
import QueueCreate from './QueueCreate.vue';
import ActiveQueues from './ActiveQueues.vue';
import Queue from './Queue.vue';

console.log('📦 Меню загружено');

const { auth } = useGlobalState(); // ← Теперь работает, так как useGlobalState импортирован

// ✅ Навигация
const onProfile = () => $navigateTo(Profile, { transition: { name: 'slide', duration: 300, curve: 'easeOut' } });
const onActiveQueues = () => $navigateTo(ActiveQueues, { transition: { name: 'slide', duration: 300, curve: 'easeOut' } });
const onCreateQueues = () => $navigateTo(QueueCreate, { transition: { name: 'slide', duration: 300, curve: 'easeOut' } });

// ✅ Функция быстрого входа (исправленная)
const onQuickJoin = async () => {
  // 1️⃣ Ввод ID
  const idPrompt = await dialogPrompt({
    title: "Вступление в очередь",
    message: "Введите ID очереди:",
    inputType: "number",
    okButtonText: "Далее",
    cancelButtonText: "Отмена"
  });

  if (!idPrompt.result || !idPrompt.text) return;
  const queueId = parseInt(idPrompt.text, 10);
  if (isNaN(queueId)) {
    await dialogAlert({ title: "Ошибка", message: "ID должен быть числом", okButtonText: "ОК" });
    return;
  }

  // 2️⃣ Ввод пароля
  const passPrompt = await dialogPrompt({
    title: `Очередь #${queueId}`,
    message: "Введите пароль для входа:",
    inputType: "password",
    okButtonText: "Войти",
    cancelButtonText: "Отмена"
  });

  if (!passPrompt.result || !passPrompt.text) return;
  const password = passPrompt.text;

  // 3️⃣ Запрос к API
  try {
    // ✅ Теперь appSettings и api определены благодаря импортам выше
    const token = auth.state.value.context.token || appSettings.getString('auth_token');
    if (!token) throw new Error('Требуется авторизация');

    await api.joinQueueWithPassword(queueId, password, token);

    console.log(`✅ Успешно присоединился к очереди #${queueId}`);

    // 4️⃣ Переход в очередь
    $navigateTo(Queue, {
      transition: { name: 'slide', duration: 300, curve: 'easeOut' },
      context: { queueId }
    });

  } catch (e: any) {
    console.error('❌ Ошибка вступления:', e.message);
    await dialogAlert({
      title: "Не удалось войти",
      message: e.message || "Проверьте ID и пароль",
      okButtonText: "ОК"
    });
  }
};
</script>

<template>
    <Page actionBarHidden="true" class="light-yellow-bg">
        <StackLayout>

          <Label text="QueLab" class="quelab-title" />
          <Button text="Профиль" @tap="onProfile" class="vibe-button" />
          <Button text="Активные очереди" @tap="onActiveQueues" class="vibe-button" />
          <Button text="Создать очередь" @tap="onCreateQueues" class="vibe-button" />
          <Button text="Встать в очередь" @tap="onQuickJoin" class="vibe-button" />

        </StackLayout>
    </Page>
</template>

