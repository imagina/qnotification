<template>
  <q-dialog v-model="dialog">
    <q-card rounded style="width: 600px;">
      <q-card-section>
        <div class="row justify-between items-center">
          <div class="text-subtitle1 row items-center">
            <q-icon name="fa-light fa-bell" color="blue-grey" size="20px" class="q-mr-sm" />
            <label>{{ $tr('isite.cms.label.notification', { capitalize: true }) }}</label>
          </div>
          <!-- Close icon -->
          <q-icon name="fa-light fa-times" color="blue-grey" size="23px" class="cursor-pointer" @click="closeModal()" />
        </div>
      </q-card-section>
      <q-card-section>
        <!--notification-->
        <q-item class="no-margin no-padding">
          <q-item-section avatar top>
            <div class="flex flex-center tw-w-[70px] tw-h-[70px] tw-bg-gray-100 tw-rounded-lg notification-notification-icon-big">
              <q-icon :name="icon" :style="{color: iconColor, fontSize: '48px' }" />
            </div>
          </q-item-section>

          <q-item-section top>
            <q-item-label>
              <span class="text-weight-medium text-weight-bold">{{ notification.title }}"</span>
            </q-item-label>
            <q-item-label>
              <div class="text-body2" v-html="notification.message">
              </div>
            </q-item-label>
            <q-item-label lines="1">
              <span class="text-caption text-grey-8">{{ notification.timeAgo }}
                <q-tooltip anchor="bottom end" self="center right">
                  {{ notification.createdAt }}
                </q-tooltip>
              </span>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-card-section>
      <q-card-section v-if="imageUrl">
        <div
          class="notification-notification-image"
          :style="`background-image: url('${imageUrl}')`">
        </div>
      </q-card-section>
      <q-card-section>
        <q-card-actions align="right" v-if="notification.link">
          <q-btn
            :label="$tr('notification.cms.cancel')"
            rounded
            no-caps
            unelevated
            color="grey"
            @click="closeModal()"
            class="q-px-sm"
          />
          <q-btn
            rounded
            no-caps
            unelevated
            color="secondary"
            @click="goToLink()"
            class="q-px-sm"
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
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import controller from 'src/modules/qnotification/_components/notificationDialog/controller';

export default defineComponent({
  props: {
    notification: { default: {} },
    icon: { default: '' },
    iconColor: { default: '' }
  },
  components: {},
  setup(props, { emit }) {
    return controller(props, emit);
  }
});
</script>
<style lang="scss">
</style>
