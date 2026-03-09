<script lang="ts" setup>
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  $navigateTo,
} from 'nativescript-vue';
import Details from './Details.vue';
import Profile from './Profile.vue';
import ActiveQueues from './ActiveQueues.vue';
import { Label, ScrollView } from '@nativescript/core';

const onProfile = () => {
  $navigateTo(Profile, {
    transition: {
      name: 'slide',
      duration: 300,
      curve: 'easeOut'
    }
  });
};

const onActiveQueues = () => {
  $navigateTo(ActiveQueues, {
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

          <Label text="QueLab" class="quelab-title" />
          <Button text="Профиль" @tap="onProfile" class="vibe-button" />
          <Button text="Активные очереди" @tap="onActiveQueues" class="vibe-button" />
          <Button text="Создать очередь" @tap="onCreateQueue" class="vibe-button" />

        </StackLayout>
    </Page>
</template>

