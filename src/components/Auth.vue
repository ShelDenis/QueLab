<script lang="ts" setup>
import { ref, watch } from 'nativescript-vue';
import { $navigateTo } from 'nativescript-vue';
import { alert } from '@nativescript/core/ui/dialogs'; // ✅ Правильный импорт
import { authMachine } from '../machines/authMachine';
import Menu from './Menu.vue';
import { api } from '../services/api';
import { useGlobalState } from '../services/stateService';

const { auth } = useGlobalState();
const { state, send } = auth;

const email = ref('');
const password = ref('');
const isLoading = ref(false);

watch(() => state.value.value, (newState) => {
  if (newState === 'authenticated') {
    $navigateTo(Menu, {
      transition: { name: 'slide', duration: 300, curve: 'easeOut' }
    });
  }
});

const onReady = async () => {
  if (!email.value || !password.value) {
    // ✅ Используем правильную функцию alert
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

    send({
      type: 'SUCCESS',
      data: {
        token: response.access_token,
        userId: response.user_id,
        userName: response.user_name
      }
    });

    send({ type: 'SUCCESS' });

  } catch (error: any) {
    console.error('Login error:', error);
    send({ type: 'ERROR', error: error.message });

    // ✅ Показываем ошибку пользователю
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

