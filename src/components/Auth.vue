<script lang="ts" setup>
import { ref, watch, $navigateTo } from 'nativescript-vue';
import { alert } from '@nativescript/core/ui/dialogs';
import { useGlobalState } from '../services/stateService';
import { api } from '../services/api';
import Menu from './Menu.vue';

const { auth } = useGlobalState();
const { state, send } = auth;

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const hasNavigated = ref(false); // ✅ Защита от "отскакивания"

// ✅ Единый watcher: срабатывает сразу при монтировании И при изменениях
watch(
  () => state.value,
  (snap) => {
    if (hasNavigated.value) return;
    if (snap.value === 'authenticated' && snap.context.token) {
      hasNavigated.value = true;
      console.log('🚀 Запрос навигации в меню...');

      // ⏳ Даем NS время отрисовать текущий кадр и подготовить Frame
      setTimeout(() => {
        try {
          $navigateTo(Menu, {
            transition: { name: 'slide', duration: 300, curve: 'easeOut' },
            // clearHistory: true ← Убираем для первой навигации, он может ломать стек
          });
          console.log('✅ $navigateTo вызван успешно');
        } catch (e: any) {
          console.error('❌ Ошибка $navigateTo:', e.message);
        }
      }, 0);
    }
  },
  { immediate: true }
);

const onReady = async () => {
  if (!email.value || !password.value) {
    await alert({ title: 'Ошибка', message: 'Заполните все поля', okButtonText: 'ОК' });
    return;
  }

  isLoading.value = true;
  send({ type: 'UPDATE_FIELDS', email: email.value, password: password.value });
  send({ type: 'SUBMIT' });

  try {
    const response = await api.login({
      u_mail: email.value,
      u_pswrd: password.value
    });

    // ✅ Отправляем SUCCESS ТОЛЬКО ОДИН РАЗ с полными данными
    send({
      type: 'SUCCESS',
      data: {
        token: response.access_token,
        userId: response.user_id,
        userName: response.user_name
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    // ✅ Тип события должен совпадать с AuthEvent (FAILURE, а не ERROR)
    send({ type: 'FAILURE', error: error.message });

    await alert({
      title: 'Ошибка входа',
      message: error.message || 'Не удалось подключиться к серверу',
      okButtonText: 'ОК'
    });

  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <Page actionBarHidden="true" class="light-yellow-bg">
    <GridLayout rows="*, auto">
      <StackLayout row="0" class="p-20">
        <Label text="Войти" class="simple-title" />

        <Label text="Почта" class="small-text" />
        <TextField v-model="email" class="yellow-field" keyboardType="email" />

        <Label text="Пароль" class="small-text" />
        <TextField v-model="password" class="yellow-field" secure="true" />

        <!-- Индикатор загрузки от XState -->
        <ActivityIndicator :busy="state.matches('loading')" v-if="state.matches('loading')" />
      </StackLayout>

      <Button
        :text="isLoading ? 'Входим...' : 'Готово'"
        :enabled="!isLoading"
        @tap="onReady"
        class="vibe-button"
        row="1"
        style="margin-bottom: 30;"
      />
    </GridLayout>
  </Page>
</template>