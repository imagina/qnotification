<template>
  <!--Content notifications-->
  <div 
    id="drawerNotificationsComponent" 
    class="tw-bg-gray-100 tw-h-full tw-pl-4 tw-pt-4"
  >
    <!-- ===== Header ===== -->
    <div class="row justify-between items-center q-pr-md">
      <div class="text-subtitle1 row items-center">
        <q-icon name="fas fa-bell" color="primary" size="20px" class="q-mr-sm"/>
        <label>{{ $tr('isite.cms.label.notification', {capitalize: true}) }}</label>
      </div>
      <!-- Close icon -->
      <q-icon name="fas fa-times" color="blue-grey" size="20px" class="cursor-pointer"
              @click="eventBus.emit('toggleMasterDrawer', 'notification')"/>
    </div>
    <!--Separator-->
    <q-separator class="q-my-md"/>
    <!--Notifications-->
    <q-scroll-area
      :thumb-style="thumbStyle" 
      v-if="notificationsData.length"
      class="scroll-area"
    >
      <!--Notifications List-->
      <template v-for="notification in notificationsData">
        <div 
          v-if="notification.message"
          :key="notification.id" 
          @click="handlerActon(notification)"
          :class="{
            'tw-cursor-pointer': notification.link,
          }"
          class="
            tw-flex-col
            tw-rounded-lg
            tw-shadow-lg
            tw-bg-white
            tw-p-3.5
            tw-mr-4
            tw-mb-4
          "
        >
          <section class="tw-flex">
            <div class="tw-mr-2">
              <q-badge 
                v-if="!notification.isRead" 
                :color="notification.isImportant ? 'orange' : 'primary'"
                rounded
                class="tw-mt-2"
              />
            </div>
            <div>
              <p
                class="tw-text-sm tw-font-medium tw-mb-1.5" 
                :class="{
                  'tw-text-gray-500': notification.isRead,
                  'tw-text-black': !notification.isRead,
                }"
              >
                {{ notification.message }}
              </p>
              <p class="tw-text-xs tw-text-gray-400">
                {{ $date.getHumanCalendar(notification.createdAt) }}
              </p>
            </div>
          </section>
        </div>
      </template>
      <!--Actions-->
      <div 
        v-if="!(this.pagination.page == this.pagination.lastPage)"
        class="text-center" 
      >
        <!--Load more notifications-->
        <q-btn 
          flat
          rounded 
          no-caps 
          color="primary"
          :label="$trp('isite.cms.label.showMore')" 
          @click="getData()"
        />
      </div>
      <div
        v-else
        class="text-center tw-mt-4"
      >
        <label class="tw-text-gray-500">
          {{ $tr('isite.cms.message.noMoreNotifications') }}
        </label>
      </div>
      <!--Inner loading-->
      <inner-loading :visible="loading"/>
    </q-scroll-area>
  </div>
</template>

<script>

import storeFirebase from 'modules/qnotification/_store/firebase/index.ts';

import { eventBus } from 'src/plugins/utils'
export default {
  beforeUnmount() {
    eventBus.off('inotification.notifications.new')
  },
  props: {},
  components: {},
  mounted() {
    this.$nextTick(function () {
      this.init()
    })
  },
  beforeUnmount() {
    storeFirebase.removeEvent();
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
        page: 0,
        perPage: 15,
        lastPage: -1
      },
      eventBus
    }
  },
  computed: {
    notificationFirebase() {
      return storeFirebase.notification
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
    }
  },
  methods: {
    init() {
      storeFirebase.addEvent();
      this.listenEvents()
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
            page: (this.pagination.page + 1),
            filter: {
              me: true,
              type: 'broadcast'
            }
          }
        }
        //get notifications
        this.$crud.index('apiRoutes.qnotification.notifications', requestParams).then(response => {
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
    //Notification Action
    handlerActon(notification) {
      //Set as readed
      if (!notification.isRead) {
        //Request
        this.$crud.update('apiRoutes.qnotification.markRead', notification.id, {})
        //Change local data
        let notificationIndex = this.notifications.findIndex(item => item.id == notification.id)
        this.notifications[notificationIndex].isRead = true
      }
      //Go to link
      if (notification.link) this.$helper.openExternalURL(notification.link, true)//open expernal URL
    },
  }
}
</script>
<style lang="scss">
#drawerNotificationsComponent {
  .scroll-area {
    height: 92%;
  }

  .item {
    font-size: 13px;
    border-radius: 5px;
    padding: 8px 8px 8px 0;
    margin-right: 8px;

    &:hover {
      background-color: #f7f6f6;
    }

    .text-item {
      min-height: 60px;
      line-height: 1.2;
      max-width: 190px;
    }

    .icon-item {
      font-size: 23px;
      width: 50px;
      height: 50px;
      background-color: #EEEEEE;
      position: absolute;
      left: 0;
      border-radius: 50%;
    }
  }
}
</style>
