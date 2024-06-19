<template>
  <!--Content notifications-->
  <div
    id="drawerNotificationsComponent"
    :style="style"
  >
    <!-- ===== Header ===== -->
    <div class="row col justify-between items-center tw-p-5">
      <label class="tw-text-xl tw-leading-5 text-weight-bold">{{ $tr('notification.cms.sidebar.adminGroup') }}</label>
      <div class="tw-flex tw-justify-end tw-content-center tw-items-center tw-gap-x-4">
        <!-- Close icon -->
        <q-btn
          unelevated
          rounded
          dense
          padding="none"
          size="xs"
          @click="eventBus.emit('toggleMasterDrawer', 'notification')"
        >
          <q-icon
            name="fa-regular fa-times"
            color="grey-7"
            size="22px"
            class="cursor-pointer"
          />
        </q-btn>
      </div>

    </div>
    <!--Separator-->
    <q-separator/>
    <!--Content-->
    <div class="full-width tw-px-5 tw-pt-[15px]">
      <div class="flex justify-end" v-show="notificationsData.length && !loading && notificationUnread">
        <q-btn
          class="tw-text-sm tw-leading-[18px] tw-font-semibold"
          flat
          dense
          unelevated
          no-caps
          padding="none"
          :label="$tr('notification.cms.markAllAsRead')"
          @click="markAllAsRead()"
        />
      </div>

      <!--Notifications List-->
      <q-virtual-scroll
        class="max-height-scroll"
        :items="notificationsData.slice(0, 5)"
        separator
        v-slot="{ item, index }"
      >
        <notification-card
          :key="item.id"
          :item-notification="item"
          :source-settings="sourceSettings"
          @open-modal="(val) => openModal(val)"
        />
      </q-virtual-scroll>
      <!--Inner loading-->
      <inner-loading :visible="loading"/>

      <div v-if="notificationsData.length && !loading">
        <!-- Go to notifications -->
        <q-btn
          unelevated
          dense
          no-caps
          class="full-width tw-mt-4 tw-mb-6 tw-rounded-lg"
          color="grey-5"
          text-color="grey-8"
          @click="gotoNotifications()"
          :label="$tr('notification.cms.seeAll', { capitalize: true })"
        />
      </div>
      <div
        v-else-if="!loading"
        class="text-center tw-mt-4 tw-pl-5"
      >
        <label class="tw-text-gray-500">
          {{ $tr('isite.cms.message.noMoreNotifications') }}
        </label>
      </div>
    </div>

    <!--- dialog --->
    <notification-dialog
      v-model="dialog"
      :notification="selectedNotification"
    />
  </div>
</template>

<script>
import services from 'src/modules/qnotification/services'
import notificationCard from 'src/modules/qnotification/_components/notificationCard/index.vue'
import notificationDialog from 'src/modules/qnotification/_components/notificationDialog/index.vue'

import storeFirebase from 'modules/qnotification/_store/firebase/index.ts';

import { eventBus } from 'src/plugins/utils'
export default {
  beforeUnmount() {
    eventBus.off('inotification.notifications.new')
    storeFirebase.removeEvent();
  },
  props: {
    isMobile: false
  },
  components: {
    notificationCard,
    notificationDialog
  },
  mounted() {
    this.$nextTick(function () {
      this.init()
    })
  },
  watch: {
    notificationFirebase: {
      deep: true,
      handler: function (newValue, oldValue) {
        this.notifications.unshift(newValue);
      }
    },
  },
  data() {
    return {
      loading: false,
      notifications: [],
      thumbStyle: {
        right: '4px',
        borderRadius: '5px',
        backgroundColor: '$custom-accent-color',
        width: '5px',
        opacity: 0.1
      },
      refScrollArea: null,
      pagination: {
        page: 1,
        perPage: 5,
        lastPage: -1
      },
      sourceSettings: null,
      eventBus,
      dialog: false,
      selectedNotification: null
    }
  },
  computed: {
    notificationFirebase() {
      return storeFirebase.notification
    },
    style() {
      return this.isMobile ? 'margin: 0px;' : 'margin: 50px 10px 0px 0px;'
    },
    //Items transformed
    notificationsData() {
      //Default response
      let response = []
      let notifications = this.$clone(this.notifications)

      //Emit badge
      eventBus.emit('header.badge.manage', {notification: false})

      //Parse notifications
      if (notifications && notifications.length) {
        notifications.forEach(notification => {
          //Instance notification data
          let notificationData = {
            id: notification.id || this.$uid(),
            message: `<b>${notification.title}</b> ${notification.message}`,
            icon: notification.icon || 'fas fa-bell',
            createdAt: notification.createdAt || this.$moment(),
            isRead: notification.isRead || false,
            link: notification.link || false,
            isImportant: (notification.options && notification.options.isImportant) ? notification.options.isImportant : false,
          }

          //Show alert important notification
          if (!notification.isRead && notification.options && notification.options.isImportant) {
            this.$alert.warning({
              mode: 'modal',
              message: notificationData.message,
              icon: notificationData.icon,
              actions: [{
                label: this.$tr('isite.cms.label.ok'),
                color: 'green',
                handler: () => this.handlerActon(notificationData)
              }],
            })
          }

          //Show badge header button
          if (!notification.isRead)
            eventBus.emit('header.badge.manage', {notification: true})

          //Add notification data to response
          response.push(notification)
        })
      }

      //Response
      return response
    },
    notificationUnread() {
      return !!this.notificationsData.filter(item => !item.isRead)?.length
    },
  },
  methods: {
    async init() {
      storeFirebase.addEvent();
      this.listenEvents()
      await this.getSources()
      this.getData();
      storeFirebase.icon = this.$store.state.qsiteApp.logo;
    },
    //Listen events
    listenEvents() {
     eventBus.on('inotification.notifications.new', response => {
        //Add notification
        this.notifications.unshift(response)
        //Show alert notification
        this.$alert.info({
          message: `${response.message.substr(0, 30)}...`,
          icon: 'fas fa-bell',
          actions: [{
            label: this.$tr('isite.cms.label.show'),
            color: 'white',
            handler: () => eventBus.emit('openMasterDrawer', 'notification')
          }],
        })
        //Play sound
        this.$helper.playSound({url: `${this.$store.state.qsiteApp.baseUrl}/modules/notification/audio/sound_notification.mp3`});
      })
    },
    //Get notifications
    getData() {
      return new Promise((resolve, reject) => {
        this.loading = true

        //Request Params
        let requestParams = {
          refresh: true,
          params: {
            take: this.pagination.perPage,
            page: this.pagination.page,
            filter: {
              me: true,
              type: 'broadcast'
            }
          }
        }
        //get notifications
        services.getNotifications(requestParams).then(response => {
          this.notifications = [...this.notifications, ...response.data]
          this.pagination.lastPage = response.meta.page.lastPage
          this.pagination.page = response.meta.page.currentPage
          this.loading = false
          resolve(response.data)
        }).catch(error => {
          this.$apiResponse.handleError(error, () => {
            this.loading = false
          })
        })
      })
    },
    gotoNotifications(){
      if(this.$route.name != 'notification.admin.notificationIndex'){
        this.$router.push({name: 'notification.admin.notificationIndex'})
      }
    },
    getSources(){
      this.loading = true
      services.getSources().then( (sources) => {
        this.sourceSettings = sources
      })
    },
    lastItem(notification){
      const last = this.notifications[this.notifications.length - 1]
      return last.id == notification.id
    },
    markAsRead(notification){
      this.notifications.find((e) => {
        if(e.id == notification.id){
          e.isRead = true
        }
      })
    },
    markAllAsRead(){
      this.notifications = this.notifications.map((noti) => ({
        ...noti,
        isRead: true
      }))

      services.markAllAsRead()
    },
    openModal(notification) {
      this.selectedNotification = notification;
      this.dialog = true
    }

  }
}
</script>
<style lang="scss" scoped>
#drawerNotificationsComponent {
  background-color: rgb(255, 255, 255);
  border-radius: 15px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.06), 0px 5px 20px rgba(0, 0, 0, 0.04), 0px 2px 6px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(20px);
  min-height: 300px;
  height: auto;
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  z-index: 2000;

  .max-height-scroll {
    max-height: calc(100vh - 217px);
    margin-top: 5px;
  }
}
</style>
