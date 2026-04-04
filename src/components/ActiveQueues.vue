<script lang="ts" setup>
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  $navigateTo,
} from 'nativescript-vue';
import Details from './Details.vue';
import Menu from './Menu.vue';
import Queue from './Queue.vue';
import { Label, ScrollView } from '@nativescript/core';

const onMenu = () => {
  $navigateTo(Menu, {
    transition: {
      name: 'slide',
      duration: 300,
      curve: 'easeOut'
    }
  });
};

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

              <Image
                src="~/assets/arrow_back.png"
                @tap="onMenu"
                horizontalAlignment="left"
                width="60"
                height="60"
                class="back-button"
              />

          <Label text="Активные очереди" class="medium-text" />

          <Button text="Практикум" @tap="onQueue" class="vibe-button"/>

        </StackLayout>
    </Page>
</template>

