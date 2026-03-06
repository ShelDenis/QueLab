<script lang="ts" setup>
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  $navigateTo,
} from 'nativescript-vue';
import Details from './Details.vue';
import { Label, ScrollView } from '@nativescript/core';
</script>

<template>
  <Frame>
    <Page actionBarHidden="true">
        <StackLayout>

          <Label text="QueLab" class="quelab-title" />
          <Button text="Профиль" @tap="onProfile" class="vibe-button" />
          <Button text="Активные очереди" @tap="onActiveQueues" class="vibe-button" />
          <Button text="Создать очередь" @tap="onCreateQueue" class="vibe-button" />

        </StackLayout>
    </Page>
  </Frame>
</template>

<style>
/* .info {
    font-size: 20;
  } */
</style>
