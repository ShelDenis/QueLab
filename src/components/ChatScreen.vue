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

          <Label text="Практикум" class="big-text" />

         <FlexboxLayout
            flexDirection="column"
           alignItems="center"
           justifyContent="center"
           class="chat-field"
           width="auto"
           height="60%"
         >

             <FlexboxLayout
                 @tap="onTap"
                 class="chat-message"
                 alignItems="center"
                 width="100%"
                 margin="5"
               >
                 <Image src="~/assets/avatar2.jpg"
                 width="50"
                 height="50"
                 class="button-icon"
                 stretch="aspectFill"/>
                 <Label text="Привет!" class="" />
               </FlexboxLayout>

               <FlexboxLayout
                    @tap="onTap"
                    class="chat-message"
                    alignItems="center"
                    width="100%"
                    margin="5"
                  >
                    <Image src="~/assets/avatar3.jpg"
                    width="50"
                    height="50"
                    class="button-icon"
                    stretch="aspectFill"/>
                    <Label text="Приветики-пистолетики!" class="" />
                  </FlexboxLayout>

         </FlexboxLayout>
         <FlexboxLayout
           flexDirection="row"
           alignItems="center"
           width="100%"
         >
           <TextField
             class="blue-field"
             flexGrow="1"
             marginRight="10"
             textWrap="true"
           />

           <FlexboxLayout
             @tap="onButtonTap"
             width="50"
             height="50"
             borderRadius="25"
             backgroundColor="#009DFF"
             alignItems="center"
             justifyContent="center"
             margin="10"
           >
             <Image
               src="~/assets/send.png"
               width="30"
               height="30"
               stretch="aspectFit"
             />
           </FlexboxLayout>
          </FlexboxLayout>
        </StackLayout>
    </Page>
</template>

