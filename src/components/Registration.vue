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
import { Label, ScrollView } from '@nativescript/core';

const onReady = () => {
  $navigateTo(Menu, {
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
        <GridLayout rows="*, auto">
            <StackLayout row="0">

              <Label text="Регистрация" class="simple-title" />

              <Label text="Имя" class="small-text" />
              <TextField class="yellow-field"/>

              <Label text="Фамилия" class="small-text" />
              <TextField class="yellow-field"/>

              <Label text="Почта" class="small-text" />
              <TextField class="yellow-field"/>

              <Label text="Пароль" class="small-text" />
              <TextField class="yellow-field"/>

              <Label text="Повторите пароль" class="small-text" />
              <TextField class="yellow-field"/>

            </StackLayout>

            <Button text="Готово" @tap="onReady" class="vibe-button" row="1" style="margin-bottom: 30;" />
        </GridLayout>
    </Page>
</template>

