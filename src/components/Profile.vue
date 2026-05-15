<!-- src/components/Profile.vue -->
<script lang="ts" setup>
import { application } from '@nativescript/core/application';
import { computed, ref } from 'nativescript-vue';
import { $navigateTo } from 'nativescript-vue';
import { alert, action } from '@nativescript/core/ui/dialogs';
import * as imagePicker from '@nativescript/imagepicker';
import { useGlobalState } from '../services/stateService';
import { api } from '../services/api';
import Menu from './Menu.vue';

const { auth } = useGlobalState();
const { state, send } = auth;
const isUploading = ref(false);

// Вычисляемые свойства
const userName = computed(() => state.value.context.userName || 'Пользователь');
const userEmail = computed(() => state.value.context.email || 'email не указан');

const userAvatar = computed(() => {
  const ctx = state.value.context;
  if (ctx.avatarUrl) {
    return ctx.avatarUrl.startsWith('http')
      ? ctx.avatarUrl
      : `http://192.168.31.17:8000${ctx.avatarUrl}`; // ← Замените IP и порт на ваши!
  }
  return '~/assets/avatar.jpg';
});

// Обработчик кнопки "+"
const onEditAvatar = async () => {
  console.log('🟢 [START] onEditAvatar вызвана');
  try {
    const choice = await action({
      title: 'Аватар',
      message: 'Что сделать?',
      cancelButtonText: 'Отмена',
      actions: ['Выбрать фото', 'Удалить аватар']
    });
    console.log('🟡 [ACTION] Выбрано:', choice);

    if (choice === 'Отмена') return;
    if (choice === 'Удалить аватар') {
      send({ type: 'UPDATE_AVATAR', data: { avatarUrl: null } });
      return;
    }

    let imageUri: string | null = null;

    if (choice === 'Выбрать фото') {
      console.log('🔵 [PICKER] Открываем галерею...');
      const picker = imagePicker.create({ mode: 'single', mediaType: 'image' });
      await picker.authorize();
      const selection = await picker.present();
      console.log('🟣 [PICKER] selection:', selection);

      const asset = selection[0] || (selection as any).getItem?.(0);
      console.log('🟠 [ASSET] asset:', asset);

      if (asset) {
        let sourcePath = asset.path;
        console.log('🔍 [PATH] sourcePath:', sourcePath);

                        if (sourcePath) {
                          const decodedPath = decodeURIComponent(sourcePath);
                          console.log('🔓 Декодированный путь:', decodedPath);

                          if (decodedPath.startsWith('content://')) {
                            console.log('⚙️ [IO] Используем ImageSource.fromAsset с правильным объектом...');

                            try {
                              // ✅ Динамический импорт (обходит баги Webpack)
                              const { ImageSource } = require('@nativescript/core/image-source');

                              // ✅ КЛЮЧЕВОЙ МОМЕНТ: передаём asset.asset (внутренний ImageAsset), а не обёртку
                              const actualAsset = asset.asset || asset;
                              console.log('🎯 Передаём в fromAsset:', actualAsset.constructor?.name);

                              const imgSource = await ImageSource.fromAsset(actualAsset);

                              if (imgSource) {
                                // Сохраняем во временную папку
                                const fs = require('@nativescript/core/file-system');
                                const tempPath = fs.path.join(fs.knownFolders.temp().path, 'picked_avatar.jpg');
                                const saved = imgSource.saveToFile(tempPath, 'jpeg', 85);

                                if (saved) {
                                  imageUri = tempPath;
                                  console.log('✅ [IO] Файл сохранён во временную папку:', imageUri);
                                } else {
                                  throw new Error('saveToFile вернул false');
                                }
                              } else {
                                throw new Error('ImageSource.fromAsset вернул null');
                              }

                            } catch (e: any) {
                              console.error('❌ Ошибка ImageSource:', e.message);
                              // Фоллбэк: пробуем прочитать напрямую (может сработать на некоторых устройствах)
                              try {
                                const { ImageSource } = require('@nativescript/core/image-source');
                                const fs = require('@nativescript/core/file-system');
                                const imgSource = await ImageSource.fromFile(decodedPath);
                                const tempPath = fs.path.join(fs.knownFolders.temp().path, 'fallback.jpg');
                                if (imgSource.saveToFile(tempPath, 'jpeg', 85)) {
                                  imageUri = tempPath;
                                  console.log('✅ [FALLBACK] Сработал прямой доступ:', imageUri);
                                }
                              } catch (fbErr) {
                                console.error('❌ Фоллбэк тоже упал:', fbErr.message);
                                throw e; // Пробрасываем оригинальную ошибку
                              }
                            }
                          } else {
                            // Обычный путь (file:// или /storage/...)
                            imageUri = decodedPath;
                            console.log('✅ [IO] Прямой путь:', imageUri);
                          }
                        }
      } else {
        console.log('⚠️ [ASSET] asset равен null/undefined');
      }
    }

    console.log('🔚 [CHECK] Итоговый imageUri:', imageUri);
    if (!imageUri) {
      await alert({ title: 'Внимание', message: 'Не удалось получить фото', okButtonText: 'ОК' });
      return;
    }

    // Здесь будет ваша логика загрузки...
    console.log('🚀 [UPLOAD] Начинаем загрузку...');
    isUploading.value = true;
    const token = state.value.context.token;
    if (!token) throw new Error('Пользователь не авторизован');

    const response = await api.uploadUserAvatar(imageUri, token);
    console.log('✅ [UPLOAD] Ответ сервера:', response);

    send({ type: 'UPDATE_AVATAR', data: { avatarUrl: response.path } });
    await alert({ title: 'Готово', message: 'Аватар обновлён!', okButtonText: 'Круто' });

  } catch (e: any) {
    console.error('🔴 [ERROR]', e.message, e.stack);
    await alert({ title: 'Ошибка', message: e.message || 'Неизвестная ошибка', okButtonText: 'ОК' });
  } finally {
    isUploading.value = false;
  }
};

const onMenu = () => {
  $navigateTo(Menu, {
    transition: { name: 'slide', duration: 300, curve: 'easeOut' }
  });
};
</script>

<template>
  <Page actionBarHidden="true" class="light-yellow-bg">
    <StackLayout>
      <!-- ✅ Кнопка назад: убраны три точки ... -->
      <Image
        src="~/assets/arrow_back.png"
        @tap="onMenu"
        horizontalAlignment="left"
        width="60"
        height="60"
        class="back-button"
      />

      <Label :text="userName" class="medium-text" />

      <!-- Аватар -->
      <GridLayout width="250" height="250">
        <Image :src="userAvatar" class="profile-img" />

        <!-- Индикатор загрузки -->
        <ActivityIndicator
          v-if="isUploading"
          :busy="true"
          width="250"
          height="250"
          color="#fff"
          backgroundColor="rgba(0,0,0,0.5)"
        />

        <!-- Кнопка редактирования -->
        <Image
          src="~/assets/plus.png"
          @tap="onEditAvatar"
          class="edit-button"
          horizontalAlignment="right"
          verticalAlignment="bottom"
          :opacity="isUploading ? 0.5 : 1"
        />
      </GridLayout>

      <Label :text="userEmail" class="medium-text" />
    </StackLayout>
  </Page>
</template>