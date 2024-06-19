<template>
  <q-dialog v-model="dialog">
    <q-card style="width: 100%; max-width: 700px; max-height: 90vh; border-radius: 15px;">
      <q-card-section class="tw-p-6">
        <div class="row justify-between items-center">
          <div class="text-subtitle1 row items-center ">
            <q-icon name="fa-solid fa-bell" color="grey-9" size="22px" class="q-mr-sm" />
            <label class="text-grey-9 text-weight-bold">{{ $tr('isite.cms.label.notification', { capitalize: true }) }}</label>
          </div>
          <!-- Close icon -->
          <q-icon name="fa-light fa-times" color="grey-7" size="20px" class="cursor-pointer" @click="closeModal()" />
        </div>
      </q-card-section>
      <div class="container-section-dialog q-pb-md">
        <div class="scrollable-section-dialog">
          <q-card-section class="tw-p-6 tw-pt-0">
            <!--notification-->
            <q-item class="no-margin no-padding">
              <q-item-section avatar top>
                <div :class="`flex flex-center tw-w-[70px] tw-h-[70px] tw-bg-[${sourceData.backgroundColor}] tw-rounded-lg notification-notification-icon-big`">
                  <q-icon :name="sourceData.icon" :style="{color: sourceData.color, fontSize: '48px' }" />
                </div>
              </q-item-section>

              <q-item-section top>
                <q-item-label>
                  <span class="tw-text-[#555555] tw-text-sm text-weight-bold">{{ notification.title }}</span>
                </q-item-label>
                <q-item-label>
                  <div class="tw-text-[#555555] tw-text-sm" v-html="notification.message">
                  </div>
                </q-item-label>
                <q-item-label lines="1">
            <span class="text-caption text-grey-6">{{ notification.timeAgo }}
              <q-tooltip anchor="bottom end" self="center right">
                {{ notification.createdAt }}
              </q-tooltip>
            </span>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-card-section>
          <q-card-section class="tw-p-6 tw-py-0" v-if="imageUrl">
            <q-img class="tw-rounded-2xl" :src="imageUrl" :ratio="16/9" />
          </q-card-section>
        </div>
      </div>
      <q-card-actions align="right" v-if="notification.link" class="q-px-md q-pb-md">
        <q-btn
          :label="$tr('notification.cms.cancel')"
          rounded
          no-caps
          unelevated
          color="grey-5"
          text-color="grey-8"
          @click="closeModal()"
          class="q-px-md tw-w-[90px]"
        />
        <q-btn
          rounded
          no-caps
          unelevated
          color="green-5"
          @click="goToLink()"
          class="q-px-md tw-w-[124px]"
        >
        <span>
          {{ linkLabel }}
        </span>
          <q-icon
            name="fa-light fa-arrow-up-right-from-square"
            color="white"
            size="14px"
            class="cursor-pointer q-ml-sm"
          />
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import controller from 'src/modules/qnotification/_components/notificationDialog/controller';

export default defineComponent({
  props: {
    notification: { default: {} },
    sourceSettings: { default: [] }
  },
  components: {},
  setup(props, { emit }) {
    return controller(props, emit);
  }
});
</script>
<style lang="scss">
.container-section-dialog {
  max-height: calc(90vh - 146px);
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.scrollable-section-dialog {
  flex-grow: 1;
  overflow-y: auto;
}
</style>
