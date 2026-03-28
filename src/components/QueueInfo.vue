<script lang="ts" setup>
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  $navigateTo,
} from 'nativescript-vue';
import Details from './Details.vue';
import Queue from './Queue.vue';
import { Label, ScrollView } from '@nativescript/core';

const onQueue = () => {
  $navigateTo(Queue, {
    transition: {
      name: 'slide',
      duration: 300,
      curve: 'easeOut'
    }
  });
};
</script>

<template>
    <Page actionBarHidden="true" class="light-yellow-bg">
        <StackLayout>

          <FlexboxLayout
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            class="header-row"
          >
            <FlexboxLayout
              @tap="onQueue"
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
          <Label text="Практикум" class="big-text" />

         <Image class='info-img' src="~/assets/queue.jpg"/>

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
           <Label
             text="Преподаватель - Яблочков А. А."
             textWrap="true"
             class="info-text"
           />

         </FlexboxLayout>

         <Label text="Создана: 19.02.2025 в 16:39" class="info-text" />
         <Label text="Всего в очереди: 3 чел." class="info-text" />

        </StackLayout>
    </Page>
</template>

