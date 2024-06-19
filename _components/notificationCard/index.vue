<template>
  <div>
    <q-item clickable dense class="q-my-sm q-px-sm" @click="openModal()">
      <q-item-section avatar top>
        <div class="flex flex-center notification-notification-icon-small tw-w-12 tw-h-12 tw-bg-gray-100 tw-rounded-lg">
          <q-icon :name="icon" :style="{color: iconColor, fontSize: '20px'}" />
        </div>
      </q-item-section>
      <q-item-section top>
        <q-item-label lines="1" class="tw-m-0 tw-mb-1">
          <span class="tw-text-base tw-leading-4 text-weight-bold text-primary">{{notification.title}}</span>
        </q-item-label>
        <q-item-label lines="2" class="tw-m-0 tw-mb-1">
          <div class="text-body2 tw-leading-[18px]" v-html="notification.message">
          </div>
        </q-item-label>
        <q-item-label caption class="no-margin">
        <span class="tw-text-[13px] tw-leading-[13px] text-grey-7">{{ notification.timeAgo }}
          <q-tooltip anchor="bottom end" self="center right">
          {{ notification.createdAt }}
        </q-tooltip>
        </span>
        </q-item-label>
      </q-item-section>
      <!-- unread notification -->
      <q-item-section side top>
        <div class="notification-unread">
          <q-badge
            v-if="isUnread"
            :color="notification.isImportant ? 'orange' : 'blue'"
            rounded
          />
          <q-btn
            v-if="isUnread && showMarkAsRead"
            class="notification-mark-as-read"
            rounded
            dense
            unelevated
            no-caps
            size="md"
            @click.stop="markAsReadHandler()"
            :label="$tr('notification.cms.markAsRead')"
            :loading="loading"
          />
        </div>
      </q-item-section>
    </q-item>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue';
import controller from 'src/modules/qnotification/_components/notificationCard/controller';

export default defineComponent({
  props: {
    itemNotification: { default: {} },
    icon: { default: 'fa-light fa-bell' },
    iconColor: { default: '#2196f3' },
    showMarkAsRead: { default: false }
  },

  components: {},
  emits: ['read', 'openModal'],
  setup(props, { emit }) {
    return controller(props, emit);
  }
});
</script>
<style lang="scss">
</style>
