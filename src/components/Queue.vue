<!-- src/components/Queue.vue -->
<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { confirm, alert } from '@nativescript/core/ui/dialogs';
import { $navigateBack, $navigateTo } from 'nativescript-vue';
import * as appSettings from '@nativescript/core/application-settings';
import { useGlobalState } from '../services/stateService';
import { api, QueueDetails, QueueParticipant } from '../services/api';
import { Utils } from '@nativescript/core';
import ActiveQueues from './ActiveQueues.vue';
import QueueInfo from './QueueInfo.vue';
import ChatScreen from './ChatScreen.vue';

const { auth, online } = useGlobalState();
const { state: oState } = online;

const queueData = ref<QueueDetails | null>(null);
const isLoading = ref(true);
const queueId = ref<number | null>(null);

const isFirstInQueue = computed(() => {
  const myId = auth.state.value.context.userId;
  if (!queueData.value || !myId || !queueData.value.participants) return false;

  const me = queueData.value.participants.find(p => p.u_id === myId);
  return me?.position === 1;
});


const loadQueues = async () => {
  isLoading.value = true;
  try {
    const token = auth.state.value.context.token;
    if (!token) throw new Error('Требуется авторизация');

    queues.value = await api.getActiveQueues(token);
    console.log(`✅ Загружено очередей: ${queues.value.length}`);
  } catch (e: any) {
    console.error('❌ Ошибка загрузки списка:', e.message);

  } finally {
    isLoading.value = false;
  }
};

const onLeaveSuccess = async () => {
  console.log('🔄 Перезагружаю список очередей...');
  await loadQueues(); // Перезагружаем список

  // Если список стал пустым — можно показать подсказку
  if (queues.value.length === 0) {
    await alert({
      title: 'Инфо',
      message: 'Вы не состоите ни в одной очереди. Создайте новую или присоединитесь!',
      okButtonText: 'ОК'
    });
  }
};

// ✅ Загрузка данных при открытии страницы
const onPageLoaded = (args: any) => {
  const page = args.object;
  const context = page.navigationContext;
  const id = context?.queueId;

  if (!id) {
    console.error('❌ queueId не передан!');
    alert({ title: 'Ошибка', message: 'Не удалось открыть очередь', okButtonText: 'ОК' });
    $navigateTo(ActiveQueues, { clearHistory: true });
    return;
  }

  queueId.value = id;
  loadQueueData(id);
};

const onReturnToEnd = async () => {
  if (oState.value.matches('offline')) {
    await alert({ title: 'Нет интернета', message: 'Проверьте соединение', okButtonText: 'ОК' });
    return;
  }
  if (!queueId.value) return;

  try {
    const token = auth.state.value.context.token || appSettings.getString('auth_token');
    const res = await api.returnToEnd(queueId.value, token);

    console.log('✅ Вернулся в конец, новая позиция:', res.new_position);
    await loadQueueData(queueId.value); // Перезагружаем список для обновления позиций

    await alert({
      title: 'Готово',
      message: res.message || 'Вы перемещены в конец очереди',
      okButtonText: 'ОК'
    });
  } catch (e: any) {
    console.error('❌ Ошибка возврата:', e.message);
    await alert({ title: 'Ошибка', message: e.message || 'Не удалось переместиться', okButtonText: 'ОК' });
  }
};

// ✅ Загрузка данных очереди с бэкенда
const loadQueueData = async (id: number) => {
  isLoading.value = true;
  try {
    // Получаем токен из любого доступного источника
    const token = auth.state.value.context.token || appSettings.getString('auth_token');
    if (!token) throw new Error('Требуется авторизация');

    queueData.value = await api.getQueueDetails(id, token);
    console.log('🔍 ПОЛНЫЙ ОТВЕТ ОТ СЕРВЕРА:', JSON.stringify(queueData.value, null, 2));
    console.log(`✅ Загружена очередь: ${queueData.value.q_name}`);
  } catch (e: any) {
    console.error('❌ Ошибка загрузки:', e.message);
    alert({ title: 'Ошибка', message: 'Не удалось загрузить данные очереди', okButtonText: 'ОК' });
  } finally {
    isLoading.value = false;
  }
};

// ✅ Навигация
const onActiveQueues = () => $navigateTo(ActiveQueues, {
  transition: { name: 'slide', duration: 300, curve: 'easeOut' }
});

const onInfo = () => $navigateTo(QueueInfo, {
  context: { queueId: queueId.value },
  transition: { name: 'slide', duration: 300, curve: 'easeOut' }
});

const onChat = () => $navigateTo(ChatScreen, {
  context: { queueId: queueId.value },
  transition: { name: 'slide', duration: 300, curve: 'easeOut' }
});

// ✅ Действия с участниками
const onTap = (participant: QueueParticipant) => {
  console.log('👤 Выбран участник:', participant.u_name);
  // Можно добавить навигацию на профиль: $navigateTo(Profile, { context: { userId: participant.u_id } })
};

const onAnotherAction = () => console.log('Дополнительное действие');

// ✅ Присоединиться к очереди
const onJoinQueue = async () => {
  if (oState.value.matches('offline')) {
    await alert({ title: 'Нет интернета', message: 'Проверьте соединение', okButtonText: 'ОК' });
    return;
  }
  if (!queueId.value) return;

  try {
    const token = auth.state.value.context.token || appSettings.getString('auth_token');
    const res = await api.joinQueue(queueId.value, token);
    console.log('✅ Присоединился, позиция:', res.position);
    await loadQueueData(queueId.value); // Обновляем список участников
    await alert({ title: 'Готово', message: 'Вы в очереди!', okButtonText: 'ОК' });
  } catch (e: any) {
    console.error('❌ Ошибка присоединения:', e.message);
    await alert({ title: 'Ошибка', message: e.message || 'Не удалось присоединиться', okButtonText: 'ОК' });
  }
};

// ✅ Покинуть очередь
const onLeaveQueue = async () => {
  if (!queueId.value) return;

  try {
    const token = auth.state.value.context.token || appSettings.getString('auth_token');
    await api.leaveQueue(queueId.value, token);
    console.log('✅ Покинул очередь');

    await alert({ title: 'Готово', message: 'Вы покинули очередь', okButtonText: 'ОК' });

    // ✅ Если это был последний участник, очередь могла удалиться.
    // Возвращаемся к списку с полной перезагрузкой (clearHistory):
    $navigateTo(ActiveQueues, {
      clearHistory: true,
      transition: { name: 'slide', duration: 300, curve: 'easeOut' }
    });

  } catch (e: any) {
    console.error(' Ошибка выхода:', e.message);
    await alert({ title: 'Ошибка', message: e.message, okButtonText: 'ОК' });
  }
};

// ✅ Получение аватара участника
const getParticipantAvatar = (p: QueueParticipant) => {
  if (!p.u_avatar_path) return '~/assets/default_avatar.png';
  // Если путь уже полный — возвращаем как есть, иначе добавляем адрес бэкенда
  return p.u_avatar_path.startsWith('http')
    ? p.u_avatar_path
    : `http://192.168.31.17:8000${p.u_avatar_path}`; // ← Ваш актуальный IP!
};

const onDeleteQueue = async () => {
  // 1. Спрашиваем подтверждение
  const isConfirmed = await confirm({
    title: 'Удаление очереди',
    message: 'Вы уверены? Это действие нельзя отменить, и все участники будут удалены из очереди.',
    okButtonText: 'Да, удалить',
    cancelButtonText: 'Отмена',
    neutralButtonText: undefined
  });

  if (!isConfirmed) return; // Пользователь нажал "Отмена"

  try {
    const token = auth.state.value.context.token || appSettings.getString('auth_token');
    await api.deleteQueue(queueId.value!, token);

    console.log('✅ Очередь удалена');
    await alert({ title: 'Готово', message: 'Очередь удалена', okButtonText: 'ОК' });

    // 2. Возвращаемся к списку (clearHistory обновит список при монтировании)
    $navigateTo(ActiveQueues, {
      clearHistory: true,
      transition: { name: 'slide', duration: 300 }
    });

  } catch (e: any) {
    console.error(' Ошибка удаления:', e.message);
    await alert({
      title: 'Ошибка',
      message: e.message || 'Не удалось удалить очередь',
      okButtonText: 'ОК'
    });
  }
};

onMounted(() => {
  loadQueues();
});

const onQueueTap = (queue: any) => {
  $navigateTo(Queue, {
    transition: { name: 'slide', duration: 300, curve: 'easeOut' },
    context: { queueId: queue.q_id, onLeave: onLeaveSuccess } // ← Передаём коллбек!
  });
};

const generateQueuePassword = (name: string): string => {
  let total = 0;
  for (const char of name) {
    const c = char.toUpperCase();
    if (c >= 'А' && c <= 'Я') {
      total += c.charCodeAt(0) - 'А'.charCodeAt(0) + 1;
    } else if (c >= 'A' && c <= 'Z') {
      total += c.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
    }
  }
  return String(total % 100);
};

const onCopyInvite = async () => {
  if (!queueData.value) return;

  const queueId = queueData.value.q_id;
  const queueName = queueData.value.q_name;
  const password = generateQueuePassword(queueName);

  const inviteText = `Присоединяйся к очереди! Номер - ${queueId}, Пароль - ${password}`;

  try {
    // ✅ Универсальный метод копирования (работает в любой версии NS)
    Utils.copyToClipboard(inviteText);

    await alert({
      title: "✅ Скопировано!",
      message: inviteText,
      okButtonText: "ОК"
    });

    console.log('📋 Приглашение скопировано:', inviteText);
  } catch (e: any) {
    console.error('❌ Ошибка копирования:', e.message);
    await alert({
      title: "Ошибка",
      message: "Не удалось скопировать в буфер обмена",
      okButtonText: "ОК"
    });
  }
};
</script>

<template>
    <Page actionBarHidden="true" class="light-yellow-bg" @loaded="onPageLoaded">
        <StackLayout>

          <!-- Индикатор загрузки -->
          <ActivityIndicator :busy="isLoading" v-if="isLoading" height="200" color="#333" />

          <!-- Контент очереди (после загрузки) -->
          <StackLayout v-else-if="queueData">

            <!-- Шапка с кнопками -->
            <FlexboxLayout
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              class="header-row"
            >
              <FlexboxLayout
                @tap="onActiveQueues"
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

              <FlexboxLayout flexDirection="row" alignItems="center" class="right-buttons">
                <FlexboxLayout
                  @tap="onCopyInvite"
                  alignItems="center"
                  backgroundColor="#A29DF5"
                  borderColor="#7053FF"
                  class="icon-button"
                  justifyContent="center"
                >
                  <Image src="~/assets/link.png" width="60" height="60" stretch="aspectFit" />
                </FlexboxLayout>

                <FlexboxLayout
                  @tap="onDeleteQueue"
                  alignItems="center"
                  backgroundColor="#FF5656"
                  borderColor="#ED1A1A"
                  class="icon-button"
                  justifyContent="center"
                >
                  <Image src="~/assets/trash.png" width="60" height="60" stretch="aspectFit" />
                </FlexboxLayout>

                <FlexboxLayout
                 @tap="onChat"
                 alignItems="center"
                 backgroundColor="#F2C4FF"
                 borderColor="#FF73FF"
                 justifyContent="center"
                 class="icon-button"
               >
                 <Image src="~/assets/chat.png" width="60" height="60" stretch="aspectFit" />
               </FlexboxLayout>

               <FlexboxLayout
                @tap="onInfo"
                alignItems="center"
                backgroundColor="#CCF8FF"
                borderColor="#45E9FB"
                justifyContent="center"
                class="icon-button"
              >
                <Image src="~/assets/info.png" width="60" height="60" stretch="aspectFit" />
              </FlexboxLayout>
              </FlexboxLayout>
            </FlexboxLayout>

            <!-- Название и описание очереди -->
            <Label :text="`Очередь на ${queueData.q_name}`" class="medium-text" />
            <Label :text="queueData.q_description" class="big-text" textWrap="true" />

            <!-- ✅ Список участников с позицией из БД -->
            <ScrollView row="1" orientation="vertical">
                <StackLayout>

                  <!-- ✅ Список участников с нумерацией по индексу -->
                  <StackLayout v-for="(participant, index) in queueData.participants" :key="participant.u_id">
                    <GridLayout columns="70, *" rows="auto" class="button-row" style="marginBottom: 12;">

                      <!-- Номер -->
                      <Label
                        col="0"
                        :text="String(index + 1)"
                        class="button-number-text"
                      />

                      <!-- Кнопка участника -->
                      <FlexboxLayout
                        col="1"
                        @tap="onTap(participant)"
                        class="vibe-button"
                        alignItems="center"
                      >
                        <Image
                          :src="getParticipantAvatar(participant)"
                          width="90"
                          height="90"
                          class="button-icon"
                          stretch="aspectFill"
                          borderRadius="45"
                          marginRight="10"
                        />
                        <StackLayout>
                          <Label :text="`${participant.u_name}`" class="button-text" />
                          <Label :text="`${participant.u_surname}`" class="button-text" />
                        </StackLayout>
                      </FlexboxLayout>

                    </GridLayout>
                  </StackLayout>
                </StackLayout>
              </ScrollView>


            <!-- Если участников нет -->
            <Label
              v-if="queueData.participants.length === 0"
              text="Пока нет участников. Будьте первым!"
              class="small-text"
              style="text-align: center; margin: 20; color: #666;"
            />

            <!-- Нижняя панель с кнопками действий -->
            <FlexboxLayout
              flexDirection="column"
              justifyContent="flex-end"
              alignItems="center"
              width="100%"
              height="100%"
              class="page-container"
            >
              <!-- ✅ ВАРИАНТ 1: Я первый в очереди → 3 кнопки -->
              <FlexboxLayout
                v-if="isFirstInQueue"
                flexDirection="row"
                alignItems="center"
                justifyContent="center"
                padding="10"
                margin="0"
                class="bottom-bar"
              >
                <FlexboxLayout
                  @tap="onJoinQueue"
                  :isEnabled="oState.matches('online')"
                  :opacity="oState.matches('online') ? 1 : 0.5"
                  alignItems="center"
                  justifyContent="center"
                  width="60"
                  height="60"
                  borderRadius="30"
                  backgroundColor="#71F88A"
                  borderColor="#48D828"
                  borderWidth="5"
                  marginRight="30"
                  class="icon-button"
                >
                  <Image src="~/assets/tick.png" width="40" height="40" stretch="aspectFit" />
                </FlexboxLayout>

                <FlexboxLayout
                  @tap="onReturnToEnd"
                  alignItems="center"
                  justifyContent="center"
                  width="60"
                  height="60"
                  borderRadius="30"
                  backgroundColor="#F2FF7E"
                  borderColor="#D8C928"
                  borderWidth="5"
                  marginRight="30"
                  class="icon-button"
                >
                  <Image src="~/assets/return.png" width="40" height="40" stretch="aspectFit" />
                </FlexboxLayout>

                <FlexboxLayout
                  @tap="onLeaveQueue"
                  alignItems="center"
                  justifyContent="center"
                  width="60"
                  height="60"
                  borderRadius="30"
                  backgroundColor="#FF5656"
                  borderColor="#ED1A1A"
                  borderWidth="5"
                  class="icon-button"
                >
                  <Image src="~/assets/quit.png" width="40" height="40" stretch="aspectFit" />
                </FlexboxLayout>
              </FlexboxLayout>

              <!-- ✅ ВАРИАНТ 2: Я НЕ первый → только кнопка выхода -->
              <FlexboxLayout
                v-else
                flexDirection="row"
                alignItems="center"
                justifyContent="center"
                padding="10"
                margin="0"
                class="bottom-bar"
              >
                <FlexboxLayout
                  @tap="onLeaveQueue"
                  alignItems="center"
                  justifyContent="center"
                  width="60"
                  height="60"
                  borderRadius="30"
                  backgroundColor="#FF5656"
                  borderColor="#ED1A1A"
                  borderWidth="5"
                  class="icon-button"
                >
                  <Image src="~/assets/quit.png" width="40" height="40" stretch="aspectFit" />
                </FlexboxLayout>
              </FlexboxLayout>

            </FlexboxLayout>

          </StackLayout>

          <!-- Ошибка загрузки -->
          <Label
            v-else
            text="Не удалось загрузить очередь"
            class="error-text"
            style="color: red; text-align: center; padding: 40;"
          />

        </StackLayout>
    </Page>
</template>