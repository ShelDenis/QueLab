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

const onMenu = () => {
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

                      <Image
                          src="~/assets/arrow_back.png"
                          @tap="onMenu"
                          horizontalAlignment="left"
                          width="60"
                          height="60"
                          class="back-button"
                        />

                      <Label text="Создание очереди" class="simple-small-title" />

                      <Label text="Название" class="small-text" />
                      <TextField class="yellow-field"/>

                      <Label text="Описание" class="small-text" />
                      <TextField class="yellow-big-field"/>

                      <Label text="Картинка" class="small-text" />

                      <FlexboxLayout
                          @tap="onInfo"
                          alignItems="center"
                          backgroundColor="#DAE443"
                          justifyContent="center"
                          class="square-button"
                        >
                          <Image
                            src="~/assets/upload.png"
                            width="60"
                            height="60"
                            stretch="aspectFit"
                          />
                        </FlexboxLayout>

                      <FlexboxLayout
                          alignItems="center"
                          justifyContent="flex-end"
                          margin="20">
                      <FlexboxLayout
                        @tap="onInfo"
                        alignItems="center"
                        backgroundColor="#71F88A"
                        justifyContent="center"
                        class="square-button"
                      >
                        <Image
                          src="~/assets/tick.png"
                          width="60"
                          height="60"
                          stretch="aspectFit"
                        />
                      </FlexboxLayout>
                      </FlexboxLayout>
                    </StackLayout>
                </GridLayout>
    </Page>
</template>

