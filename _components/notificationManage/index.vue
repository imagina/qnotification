<template>
  <div>
    <div v-for="(item, index) in items" :key="item.id || index">
      <notification-card
        :item-notification="item"
        :icon="getIcon(item)"
        :icon-color="getIconColor(item)"
        :show-mark-as-read="showMarkAsRead"
        @open-modal="(val) => openModal(val)"
      />
      <q-separator v-if="!lastItem(index)"/>
    </div>
    <!------ dialog ------->
    <notification-dialog
      v-model="dialog"
      :notification="notification"
      :icon="getIcon(notification)"
      :icon-color="getIconColor(notification)"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import controller from 'src/modules/qnotification/_components/notificationManage/controller';
import notificationDialog from 'src/modules/qnotification/_components/notificationDialog/index.vue'
import notificationCard from '../notificationCard/index.vue';

export default defineComponent({
  props: {
    sourceSettings: { default: [] },
    items: { default: [] },
    showMarkAsRead: { default: false }
  },
  components: {
    notificationCard,
    notificationDialog
  },
  setup(props, { emit }) {
    return controller(props, emit);
  }
});
</script>
<style lang="scss">
</style>
