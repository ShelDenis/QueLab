<script lang="ts" setup>
import { ref, watch } from 'nativescript-vue';
import { useMachine } from '@xstate/vue';
import { authMachine } from '~/machines/authMachine.js';
import Menu from './Menu.vue';
import { $navigateTo } from 'nativescript-vue';

// Инициализируем машину
const { state, send } = useMachine(authMachine);

// Локальные реактивные переменные для полей
const email = ref('');
const password = ref('');

// Следим за состоянием машины: если аутентифицирован — переходим в меню
watch(() => state.value.value, (newState) => {
  if (newState === 'authenticated') {
    $navigateTo(Menu, {
      transition: { name: 'slide', duration: 300, curve: 'easeOut' }
    });
  }
});

const onReady = () => {
  // 1. Сначала передаем данные в машину
  send({ 
    type: 'UPDATE_FIELDS', 
    email: email.value, 
    password: password.value 
  });
  
  // 2. Запускаем процесс логина
  send({ type: 'SUBMIT' });

  // Имитируем ответ от API для теста (заглушка)
  setTimeout(() => {
    send({ type: 'SUCCESS' });
  }, 1000);
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

        <ActivityIndicator :busy="state.matches('loading')" v-if="state.matches('loading')" />
      </StackLayout>

      <Button 
        :text="state.matches('loading') ? 'Входим...' : 'Готово'" 
        @tap="onReady" 
        class="vibe-button" 
        row="1" 
        style="margin-bottom: 30;" 
      />
    </GridLayout>
  </Page>
</template>

