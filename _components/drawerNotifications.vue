<template>
  <!--Content notifications-->
  <div id="drawerNotificationsComponent">
    <!-- ===== Header ===== -->
    <div class="row justify-between items-center q-pr-md">
      <div class="text-subtitle1 row items-center">
        <q-icon name="fas fa-bell" color="primary" size="20px" class="q-mr-sm"/>
        <label>{{ $tr('isite.cms.label.notification', {capitalize: true}) }}</label>
      </div>
      <!-- Close icon -->
      <q-icon name="fas fa-times" color="blue-grey" size="20px" class="cursor-pointer"
              @click="$eventBus.$emit('toggleMasterDrawer', 'notification')"/>
    </div>
    <!--Separator-->
    <q-separator class="q-my-md"/>
    <!--Notifications-->
    <q-scroll-area :thumb-style="thumbStyle" v-if="notificationsData.length" class="relative-position"
                   style="height: calc(100vh - 93px); width: 100%">
      <!--Notifications List-->
      <div v-for="notification in notificationsData" :key="notification.id" @click="handlerActon(notification)"
           :class="`item ${notification.link ? 'cursor-pointer' : ''}`">
        <!--Content Notification-->
        <div class="relative-position q-pl-xl">
          <div class="row items-center q-pl-sm">
            <!--Bagde is read-->
            <q-badge v-if="!notification.isRead" :color="notification.isImportant ? 'orange' : 'primary'"
                     rounded floating/>
            <!--Icon-->
            <q-icon color="green" class="icon-item" :name="notification.icon"/>
            <!--Content-->
            <div class="text-item row items-center">
              <!--Message-->
              <div class="ellipsis-3-lines q-pr-xs text-grey-8">
                <div v-html="notification.message"></div>
                <q-tooltip :delay="1000" max-width="250px">
                  <label v-html="notification.message"></label>
                </q-tooltip>
              </div>
              <!--Date-->
              <div class="col-12 text-grey-6 text-caption">
                {{ $date.getHumanCalendar(notification.createdAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <!--Actions-->
      <div class="text-center q-py-md" v-if="(this.pagination.page == this.pagination.lastPage) ? false : true">
        <!--Load more notifications-->
        <q-btn unelevated color="green" rounded no-caps :label="$trp('isite.cms.label.showMore')" @click="getData()"/>
      </div>
      <!--Inner loading-->
      <inner-loading :visible="loading"/>
    </q-scroll-area>
  </div>
</template>

<script>
export default {
  beforeDestroy() {
    this.$eventBus.$off('inotification.notifications.new')
  },
  props: {},
  components: {},
  mounted() {
    this.$nextTick(function () {
      this.init()
    })
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
      pagination: {
        page: 0,
        perPage: 15,
        lastPage: -1
      },
    }
  },
  computed: {
    //Items transformed
    notificationsData() {
      //Default response
      let response = []
      let notifications = this.$clone(this.notifications)

      //Emit badge
      this.$eventBus.$emit('header.badge.manage', {notification: false})

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
            this.$eventBus.$emit('header.badge.manage', {notification: true})

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
      this.listenEvents()
      this.getData()
    },
    //Listen events
    listenEvents() {
      this.$eventBus.$on('inotification.notifications.new', response => {
        //Add notification
        this.notifications.unshift(response)
        //Show alert notification
        this.$alert.info({
          message: `${response.message.substr(0, 30)}...`,
          icon: 'fas fa-bell',
          actions: [{
            label: this.$tr('isite.cms.label.show'),
            color: 'white',
            handler: () => this.$eventBus.$emit('openMasterDrawer', 'notification')
          }],
        })
        //Play sound
        this.$helper.playSound({url: `${this.$store.state.qsiteApp.baseUrl}/modules/notification/audio/sound_notification.mp3`});
      })
    },
    //Get notifications
    getData() {
      return new ((resolve, reject) => {
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
<style lang="stylus">
#drawerNotificationsComponent
  padding 16px 0 16px 16px
  height 100%

  .item
    font-size 13px
    border-radius 5px
    padding 8px 8px 8px 0
    margin-right 8px

    &:hover
      background-color #f7f6f6

    .text-item
      min-height 60px
      line-height 1.2
      max-width 190px

    .icon-item
      font-size 23px
      width 50px
      height 50px
      background-color #EEEEEE
      position absolute
      left 0
      border-radius 50%
</style>
