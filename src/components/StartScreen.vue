<script lang="ts" setup>
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  $navigateTo,
} from 'nativescript-vue';
import Register from './Registration.vue';
import Auth from './Auth.vue';
import Details from './Details.vue';
import { Label, ScrollView } from '@nativescript/core';

const onReg = () => {
  $navigateTo(Register, {
    transition: {
      name: 'slide',
      duration: 300,
      curve: 'easeOut'
    }
  });
};

const onAuth = () => {
  $navigateTo(Auth, {
    transition: {
      name: 'slide',
      duration: 300,
      curve: 'easeOut'
    }
  });
};

</script>

<template>
  <Frame>
    <Page actionBarHidden="true" class="light-yellow-bg">
        <StackLayout>

          <Label text="QueLab" class="quelab-title" />
          <Button text="Войти" @tap="onAuth" class="vibe-button" />
          <Button text="Зарегистрироваться" @tap="onReg" class="vibe-button" />

        </StackLayout>
    </Page>
  </Frame>
</template>

