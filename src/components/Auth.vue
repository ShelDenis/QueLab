<script lang="ts" setup>
import { ref, watch, onMounted } from 'nativescript-vue'; // ← 1. Добавили onMounted
import { $navigateTo } from 'nativescript-vue';
import { alert } from '@nativescript/core/ui/dialogs';
import { authMachine } from '../machines/authMachine';
import Menu from './Menu.vue';
import { api } from '../services/api';
import { useGlobalState } from '../services/stateService';

const { auth } = useGlobalState();
const { state, send } = auth;

const email = ref('');
const password = ref('');
const isLoading = ref(false);

// ✅ 2. Проверка при монтировании (для восстановления сессии)
onMounted(() => {
  // Если машина уже в authenticated → сразу переходим
  if (state.value.value === 'authenticated' && state.value.context.token) {
    console.log('🚀 Сессия восстановлена, переход в меню...');
    $navigateTo(Menu, {
      transition: { name: 'slide', duration: 300, curve: 'easeOut' },
      clearHistory: true
    });
  }
});

// ✅ 3. Watch срабатывает при изменениях (для обычного входа)
watch(() => state.value.value, (newState) => {
  if (newState === 'authenticated') {
    console.log('🚀 Вход успешен, переход в меню...');
    $navigateTo(Menu, {
      transition: { name: 'slide', duration: 300, curve: 'easeOut' },
      clearHistory: true
    });
  }
});

const onReady = async () => {
  if (!email.value || !password.value) {
    await alert({
      title: 'Ошибка',
      message: 'Заполните все поля',
      okButtonText: 'ОК'
    });
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

    // ✅ 4. Исправлено: отправляем SUCCESS только один раз с данными
    send({
      type: 'SUCCESS',
      data: {
        token: response.access_token,
        userId: response.user_id,
        userName: response.user_name
      }
    });
    // ❌ Убрали дублирующий send({ type: 'SUCCESS' }) без data

  } catch (error: any) {
    console.error('Login error:', error);

    // ✅ 5. Исправлено: тип события должен быть 'FAILURE' (как в машине)
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