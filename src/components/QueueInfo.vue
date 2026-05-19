<script lang="ts" setup>
import { ref } from 'vue';
import { $navigateTo, alert } from 'nativescript-vue';
import { $navigateBack } from 'nativescript-vue';
import * as appSettings from '@nativescript/core/application-settings';
import { useGlobalState } from '../services/stateService';
import { api, QueueDetails } from '../services/api';
import Queue from './Queue.vue';

const { auth } = useGlobalState();
const queueInfo = ref<QueueDetails | null>(null);
const isLoading = ref(true);

// ✅ Загрузка при открытии страницы (надёжный способ через @loaded)
const onPageLoaded = (args: any) => {
  const id = args.object?.navigationContext?.queueId;
  if (!id) {
    alert({ title: 'Ошибка', message: 'Не удалось открыть информацию', okButtonText: 'ОК' });
    $navigateTo(Queue, { clearHistory: true });
    return;
  }
  loadQueueInfo(id);
};

// ✅ Запрос к бэкенду
const loadQueueInfo = async (id: number) => {
  isLoading.value = true;
  try {
    const token = auth.state.value.context.token || appSettings.getString('auth_token');
    if (!token) throw new Error('Требуется авторизация');

    queueInfo.value = await api.getQueueDetails(id, token);
    console.log('✅ Информация о очереди загружена');
  } catch (e: any) {
    console.error(' Ошибка загрузки информации:', e.message);
    await alert({ title: 'Ошибка', message: 'Не удалось загрузить данные', okButtonText: 'ОК' });
  } finally {
    isLoading.value = false;
  }
};

// ✅ Форматирование даты в русский стиль
const formatDate = (dateStr: string) => {
  if (!dateStr) return 'Не указано';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU') + ' в ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

// ✅ Подстановка изображения (локальный путь или полный URL)
const getImageUrl = (path: string | null) => {
  if (!path) return '~/assets/queue.jpg';
  return path.startsWith('http') ? path : `http://192.168.31.17:8000${path}`;
};

const onBack = () => {
  $navigateBack({
    transition: { name: 'slide', duration: 300, curve: 'easeOut' }
  });
};
</script>

<template>
    <Page actionBarHidden="true" class="light-yellow-bg" @loaded="onPageLoaded">
        <StackLayout>

          <!-- Индикатор загрузки -->
          <ActivityIndicator :busy="isLoading" v-if="isLoading" height="200" color="#333" />

          <!-- Контент (после успешной загрузки) -->
          <StackLayout v-else-if="queueInfo">

            <FlexboxLayout
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              class="header-row"
            >
              <FlexboxLayout
                @tap="onBack"
                class="back-button"
                alignItems="center"
                justifyContent="center"
              >
                <Image
                  src="~/assets/arrow_back.png"
                  width="40"
                  height="40"
                  stretch="aspectFit"
                />
              </FlexboxLayout>
            </FlexboxLayout>

            <Label text="Очередь на" class="medium-text" />
            <Label :text="queueInfo.q_name" class="big-text" />

            <Image :src="getImageUrl(queueInfo.q_img_path)" class='info-img' />

            <FlexboxLayout
              alignItems="center"
              justifyContent="center"
              backgroundColor="#FFFFF7"
              borderRadius="15"
              padding="10 20"
              margin="20"
              width="auto"
              height="auto"
            >
              <!-- 💡 Сейчас берётся из q_description. Если нужно имя создателя → обновим API -->
              <Label
                :text="`${queueInfo.q_describe || 'Не указан'}`"
                textWrap="true"
                class="info-text"
              />
            </FlexboxLayout>

            <Label :text="`Всего в очереди: ${queueInfo.participants?.length || 0} чел.`" class="info-text" />

          </StackLayout>

          <!-- Ошибка загрузки -->
          <Label
            v-else
            text="Не удалось загрузить информацию"
            class="error-text"
            style="color: red; text-align: center; padding: 40;"
          />

        </StackLayout>
    </Page>
</template>