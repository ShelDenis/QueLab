<script lang="ts" setup>
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  $navigateTo,
} from 'nativescript-vue';
import Details from './Details.vue';
import ActiveQueues from './ActiveQueues.vue';
import QueueInfo from './QueueInfo.vue';
import ChatScreen from './ChatScreen.vue';
import { Label, ScrollView } from '@nativescript/core';

const onActiveQueues = () => {
  $navigateTo(ActiveQueues, {
    transition: {
      name: 'slide',
      duration: 300,
      curve: 'easeOut'
    }
  });
};

const onInfo = () => {
  $navigateTo(QueueInfo, {
    transition: {
      name: 'slide',
      duration: 300,
      curve: 'easeOut'
    }
  });
};

const onChat = () => {
  $navigateTo(ChatScreen, {
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

            <FlexboxLayout
              flexDirection="row"
              alignItems="center"
              class="right-buttons"
            >

              <FlexboxLayout
                @tap="onAnotherAction"
                alignItems="center"
                backgroundColor="#A29DF5"
                  borderColor="#7053FF"
                  class="icon-button"
                justifyContent="center"
              >
                <Image
                  src="~/assets/link.png"
                  width="60"
                  height="60"
                  stretch="aspectFit"
                />
              </FlexboxLayout>

              <FlexboxLayout
                  @tap="onAnotherAction"
                  alignItems="center"
                  backgroundColor="#FF5656"
                    borderColor="#ED1A1A"
                    class="icon-button"
                  justifyContent="center"
                >
                  <Image
                    src="~/assets/trash.png"
                    width="60"
                    height="60"
                    stretch="aspectFit"
                  />
                </FlexboxLayout>

                <FlexboxLayout
                 @tap="onChat"
                 alignItems="center"
                 backgroundColor="#F2C4FF"
                   borderColor="#FF73FF"
                 justifyContent="center"
                 class="icon-button"
               >
                 <Image
                   src="~/assets/chat.png"
                   width="60"
                   height="60"
                   stretch="aspectFit"
                 />
               </FlexboxLayout>

               <FlexboxLayout
                @tap="onInfo"
                alignItems="center"
                backgroundColor="#CCF8FF"
                  borderColor="#45E9FB"
                justifyContent="center"
                class="icon-button"
              >
                <Image
                  src="~/assets/info.png"
                  width="60"
                  height="60"
                  stretch="aspectFit"
                />
              </FlexboxLayout>

            </FlexboxLayout>
          </FlexboxLayout>

          <Label text="Очередь на" class="medium-text" />
          <Label text="Практикум" class="big-text" />

            <FlexboxLayout
              flexDirection="row"
              alignItems="center"
              class="button-row"
              justifyContent="space-between"
            >
              <Label
                text="1"
                class="button-number-text"
                marginLeft="20"
              />

              <FlexboxLayout
                @tap="onTap"
                class="vibe-button"
                alignItems="center"
              >
                <Image src="~/assets/avatar2.jpg"
                width="100"
                height="100"
                class="button-icon"
                stretch="aspectFill"/>
                <Label text="Человек 1" class="button-text" />
              </FlexboxLayout>
            </FlexboxLayout>

            <FlexboxLayout
              flexDirection="row"
              alignItems="center"
              class="button-row"
              justifyContent="space-between"
            >
              <Label
                text="2"
                class="button-number-text"
                marginLeft="20"
              />

              <FlexboxLayout
                @tap="onTap"
                class="vibe-button"
                alignItems="center"
              >
                <Image src="~/assets/avatar3.jpg"
                 width="100"
                 height="100"
                 class="button-icon"
                 stretch="aspectFill"/>
                <Label text="Человек 2" class="button-text" />
              </FlexboxLayout>
            </FlexboxLayout>

            <FlexboxLayout
              flexDirection="row"
              alignItems="center"
              class="button-row"
              justifyContent="space-between"
            >
              <Label
                text="3"
                class="button-number-text"
                marginLeft="20"
              />

              <FlexboxLayout
                @tap="onTap"
                class="vibe-button"
                alignItems="center"
                justifyContent="space-between"
              >
                <Image src="~/assets/avatar4.jpg"
                 width="100"
                 height="100"
                 class="button-icon"
                 stretch="aspectFill"/>
                <Label text="Человек 3" class="button-text" />
              </FlexboxLayout>
            </FlexboxLayout>

            <FlexboxLayout
              flexDirection="column"
              justifyContent="flex-end"
              alignItems="center"
              width="100%"
              height="100%"
              class="page-container"
            >
              <FlexboxLayout
                flexDirection="row"
                alignItems="center"
                justifyContent="center"
                padding="10"
                margin="0"
                class="bottom-bar"
              >

                <FlexboxLayout
                  @tap="onActiveQueues"
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
                  @tap="onAnotherAction"
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
                  @tap="onActiveQueues"
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
    </Page>
</template>

