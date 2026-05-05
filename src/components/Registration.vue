<script lang="ts" setup>
import { ref } from 'nativescript-vue';
import { alert } from '@nativescript/core'; // ← 1. Импорт диалогов
import { $navigateTo, $navigateBack } from 'nativescript-vue';
import { useGlobalState } from '../services/stateService'; // ← 2. Импорт стейта
import { api } from '../services/api'; // ← 3. Импорт API
import Menu from './Menu.vue';

const { auth } = useGlobalState(); // ← 4. Получаем send из глобального стейта
const { send } = auth;

// ← 5. Реактивные переменные для полей (обязательно с v-model в шаблоне)
const name = ref('');
const surname = ref('');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const isLoading = ref(false);

const onReady = async () => { // ← 6. Делаем функцию async
  // ← 7. Валидация
  if (!name.value || !surname.value || !email.value || !password.value || !passwordConfirm.value) {
    await alert({ title: 'Ошибка', message: 'Заполните все поля', okButtonText: 'ОК' });
    return;
  }

  if (password.value !== passwordConfirm.value) {
    await alert({ title: 'Ошибка', message: 'Пароли не совпадают', okButtonText: 'ОК' });
    return;
  }

  if (password.value.length < 6) {
    await alert({ title: 'Ошибка', message: 'Пароль должен быть не менее 6 символов', okButtonText: 'ОК' });
    return;
  }

  isLoading.value = true;

  // ← 8. Уведомляем машину состояний о начале регистрации
  send({
    type: 'START_REGISTER',
    name: name.value,
    surname: surname.value,
    email: email.value,
    password: password.value
  });

  try {
    // ← 9. Реальный запрос к бэкенду
    const response = await api.register({
      u_name: name.value,
      u_surname: surname.value,
      u_mail: email.value,
      u_pswrd: password.value
    });

    // ← 10. Успех: сохраняем данные и переходим в меню
    send({
      type: 'REGISTER_SUCCESS',
      data: {  // ← ✅ Вот здесь должен быть ключ 'data' и двоеточие!
        token: response.access_token,
        userId: response.user_id,
        userName: `${name.value} ${surname.value}`
      }
    });

    $navigateTo(Menu, {
      transition: { name: 'slide', duration: 300, curve: 'easeOut' }
    });

  } catch (error: any) {
    console.error('Register error:', error);

    // ← 11. Ошибка: уведомляем машину и показываем пользователю
    send({ type: 'REGISTER_FAILURE', error: error.message });

    await alert({
      title: 'Ошибка регистрации',
      message: error.message || 'Не удалось создать аккаунт',
      okButtonText: 'ОК'
    });

  } finally {
    isLoading.value = false; // ← 12. Снимаем индикатор загрузки
  }
};
</script>

<template>
    <Page actionBarHidden="true" class="light-yellow-bg">
        <GridLayout rows="*, auto">
            <ScrollView row="0">
                <StackLayout>
                  <Label text="Регистрация" class="simple-title" />

                  <Label text="Имя" class="small-text" />
                  <TextField v-model="name" class="yellow-field"/>

                  <Label text="Фамилия" class="small-text" />
                  <TextField v-model="surname" class="yellow-field"/>

                  <Label text="Почта" class="small-text" />
                  <TextField v-model="email" class="yellow-field" keyboardType="email"/>

                  <Label text="Пароль" class="small-text" />
                  <TextField v-model="password" class="yellow-field" secure="true"/>

                  <Label text="Повторите пароль" class="small-text" />
                  <TextField v-model="passwordConfirm" class="yellow-field" secure="true"/>

                  <ActivityIndicator :busy="isLoading" v-if="isLoading" rowSpan="2" />
                </StackLayout>
              </ScrollView>

            <Button
              :text="isLoading ? 'Регистрация...' : 'Готово'"
              @tap="onReady"
              class="vibe-button"
              row="1"
              style="margin-bottom: 30;"
              :enabled="!isLoading"
            />
        </GridLayout>
    </Page>
</template>

