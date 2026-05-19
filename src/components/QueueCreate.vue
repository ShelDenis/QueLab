<!-- src/components/CreateQueue.vue -->
<script lang="ts" setup>
import { computed, ref, onMounted} from 'nativescript-vue';
import { $navigateTo, alert, action } from 'nativescript-vue';
import { alert as dialogAlert, action as dialogAction } from '@nativescript/core/ui/dialogs';
import * as imagePicker from '@nativescript/imagepicker';
import { ImageSource } from '@nativescript/core/image-source';
import { useGlobalState } from '../services/stateService';
import { api } from '../services/api';
import Menu from './Menu.vue';
import Details from './Details.vue';
import ActiveQueues from './ActiveQueues.vue';

const { auth, queue } = useGlobalState();
const { send: sendQueue } = queue;
const { state: authState } = auth;

const isSubmitting = ref(false);
const previewUri = ref<string | null>(null);

// Привязки к полям формы
const name = computed({
  get: () => queue.state.value.context.name,
  set: (val) => sendQueue({ type: 'UPDATE_NAME', name: val })
});

const description = computed({
  get: () => queue.state.value.context.description,
  set: (val) => sendQueue({ type: 'UPDATE_DESCRIPTION', description: val })
});

const hasImage = computed(() => !!queue.state.value.context.imageUri);

// Обработчик выбора картинки
const onPickImage = async () => {
  try {
    const picker = imagePicker.create({ mode: 'single', mediaType: 'image', maxWidth: 800, maxHeight: 800 });
    await picker.authorize();
    const selection = await picker.present();

    const asset = selection[0] || (selection as any).getItem?.(0);
    if (!asset) return;

    // Конвертируем в base64 через ImageSource
    const imgSource = await ImageSource.fromAsset(asset.asset || asset);
    const base64 = imgSource.toBase64String('jpeg', 80);
    const uri = asset.path || (asset.android ? String(asset.android) : null);

    if (base64 && uri) {
      sendQueue({ type: 'SET_IMAGE', data: { uri, base64 } });
      previewUri.value = uri; // Для превью в интерфейсе
    }
  } catch (e: any) {
    console.error('Pick image error:', e.message);
    await dialogAlert({ title: 'Ошибка', message: 'Не удалось выбрать изображение', okButtonText: 'ОК' });
  }
};

onMounted(() => {
  sendQueue({ type: 'RESET' });
  previewUri.value = null;
  console.log('🧹 Форма очищена');
});

// Основная функция создания
const onReady = async () => {
  // ✅ Не захватываем ctx заранее, используем name.value / description.value

  // Валидация (используем .value)
  if (!name.value.trim()) {
    await dialogAlert({ title: 'Ошибка', message: 'Введите название очереди', okButtonText: 'ОК' });
    return;
  }
  if (!description.value.trim()) {
    await dialogAlert({ title: 'Ошибка', message: 'Введите описание', okButtonText: 'ОК' });
    return;
  }

  isSubmitting.value = true;
  sendQueue({ type: 'SUBMIT' });

  try {
    const token = authState.value.context.token;
    if (!token) throw new Error('Пользователь не авторизован');

    // 🔍 Отладка: что отправляем
    console.log('🔍 Отладка перед отправкой:');
    console.log('  name.value:', name.value);
    console.log('  description.value:', description.value);
    console.log('  context:', queue.state.value.context);

    const payload: any = {
      q_name: name.value.trim(),
      q_description: description.value.trim()
    };

    if (queue.state.value.context.imageBase64) {
      payload.q_image = queue.state.value.context.imageBase64;
      payload.q_image_filename = `queue_${Date.now()}.jpg`;
    }

    console.log('📤 Payload:', payload);

    const response = await api.createQueue(payload, token);

    await dialogAlert({
      title: "✅ Очередь создана!",
      message: `ID очереди: ${response.q_id}\nПароль для входа: ${response.q_password}\n(Рассчитан автоматически из названия)`,
      okButtonText: "ОК"
    });

    sendQueue({ type: 'SUCCESS', data: { queueId: response.q_id } });

    // Сброс ПОСЛЕ успешной отправки
    sendQueue({ type: 'RESET' });
    previewUri.value = null;

    $navigateTo(ActiveQueues, {
      transition: { name: 'slide', duration: 300, curve: 'easeOut' },
      clearHistory: true
    });

  } catch (e: any) {
    console.error('Create queue error:', e.message);
    sendQueue({ type: 'FAILURE', error: e.message });
    await dialogAlert({ title: 'Ошибка', message: e.message, okButtonText: 'ОК' });
  } finally {
    isSubmitting.value = false;
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
    <GridLayout rows="*, auto">
      <StackLayout row="0">

        <!-- Кнопка назад -->
        <Image
          src="~/assets/arrow_back.png"
          @tap="onMenu"
          horizontalAlignment="left"
          width="60" height="60"
          class="back-button"
        />

        <Label text="Создание очереди" class="simple-small-title" />

        <!-- Название -->
        <Label text="Название" class="small-text" />
        <TextField
          v-model="name"
          class="yellow-field"
          hint="Введите название"
          :isEnabled="!isSubmitting"
        />

        <!-- Описание -->
        <Label text="Описание" class="small-text" />
        <TextField
          v-model="description"
          class="yellow-big-field"
          hint="Введите описание"
          textWrap="true"
          :isEnabled="!isSubmitting"
        />

        <!-- Картинка -->
        <Label text="Картинка" class="small-text" />
        <FlexboxLayout
          @tap="onPickImage"
          alignItems="center"
          backgroundColor="#DAE443"
          justifyContent="center"
          class="square-button"
          :opacity="isSubmitting ? 0.5 : 1"
        >
          <Image
            v-if="hasImage && previewUri"
            :src="previewUri"
            width="60" height="60"
            stretch="aspectFill"
            borderRadius="10"
          />
          <Image
            v-else
            src="~/assets/upload.png"
            width="60" height="60"
            stretch="aspectFit"
          />
        </FlexboxLayout>

        <!-- Индикатор загрузки -->
        <ActivityIndicator
          v-if="isSubmitting"
          :busy="true"
          width="100" height="100"
          color="#333"
        />

        <!-- Кнопка отправки -->
        <FlexboxLayout alignItems="center" justifyContent="flex-end" margin="20">
          <FlexboxLayout
            @tap="onReady"
            alignItems="center"
            backgroundColor="#71F88A"
            justifyContent="center"
            class="square-button"
            :opacity="isSubmitting ? 0.5 : 1"
          >
            <Image
              src="~/assets/tick.png"
              width="60" height="60"
              stretch="aspectFit"
            />
          </FlexboxLayout>
        </FlexboxLayout>

      </StackLayout>
    </GridLayout>
  </Page>
</template>