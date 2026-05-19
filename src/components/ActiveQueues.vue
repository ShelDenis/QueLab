<script lang="ts" setup>
import { ref, onMounted } from 'nativescript-vue';
import { $navigateTo } from 'nativescript-vue';
import { useGlobalState } from '../services/stateService';
import { api } from '../services/api';
import Details from './Details.vue';
import Menu from './Menu.vue';
import Queue from './Queue.vue';
console.log('📦 Модуль Queue.vue импортирован');

const { auth } = useGlobalState();
const queues = ref<any[]>([]);
const isLoading = ref(false);

onMounted(async () => {
  isLoading.value = true;
  try {
    const token = auth.state.value.context.token;
    if (!token) throw new Error('Пользователь не авторизован');
    queues.value = await api.getActiveQueues(token);
    console.log(`✅ Загружено очередей: ${queues.value.length}`);
  } catch (e: any) {
    console.error('❌ Ошибка загрузки очередей:', e.message);
  } finally {
    isLoading.value = false;
  }
});

const onMenu = () => {
  $navigateTo(Menu, {
    transition: { name: 'slide', duration: 300, curve: 'easeOut' }
  });
};



const onQueueTap = (queue: any) => {
  console.log('👆 Нажатая очередь:', queue);

  // Проверяем, есть ли вообще ID в объекте
  const id = queue.q_id || queue.id;

  if (!id) {
    console.error('❌ ОШИБКА: У очереди нет поля q_id или id!');
    return;
  }

  $navigateTo(Queue, {
    transition: { name: 'slide', duration: 300 },
    context: { queueId: id } // Передаем проверенный ID
  });
};
</script>

<template>
    <Page actionBarHidden="true" class="light-yellow-bg">
        <!-- ✅ Используем GridLayout, чтобы разделить фиксированную шапку и скролл -->
        <GridLayout rows="auto, *">

            <!-- Шапка (фиксированная, не скроллится) -->
            <StackLayout row="0">
              <Image
                src="~/assets/arrow_back.png"
                @tap="onMenu"
                horizontalAlignment="left"
                width="60"
                height="60"
                class="back-button"
              />
              <Label text="Активные очереди" class="medium-text" />
            </StackLayout>

            <!-- ✅ Скроллируемая область (занимает всё оставшееся место) -->
            <ScrollView row="1">
              <StackLayout>

                <!-- Динамические кнопки -->
                <Button
                  v-for="queue in queues"
                  :key="queue.q_id"
                  :text="queue.q_name"
                  @tap="onQueueTap(queue)"
                  class="vibe-button"
                  style="margin-top: 15;"
                />

                <!-- Сообщение если список пуст -->
                <Label
                  v-if="!isLoading && queues.length === 0"
                  text="Нет активных очередей"
                  class="small-text"
                  style="margin-top: 20; text-align: center; color: #666;"
                />

                <!-- Отступ снизу, чтобы последняя кнопка не прилипала к краю -->
                <StackLayout height="20" />

              </StackLayout>
            </ScrollView>

        </GridLayout>
    </Page>
</template>