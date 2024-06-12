<template>
  <!--Content notifications-->
  <div id="drawerNotificationsComponent">
    <!-- ===== Header ===== -->
    <div class="row justify-between items-center">
      <div class="col-6">
        <q-icon name="fa-light fa-bell" color="blue-grey" size="20px" class="q-mr-sm" v-if="true"/>
        <label class="text-subtitle1">{{ $tr('isite.cms.label.notification', {capitalize: true}) }}</label>
      </div>
      <div class="col-6">
        <div class="tw-flex tw-justify-end tw-content-center tw-gap-x-4">
          <!-- Go to notifications -->
          <q-btn
            unelevated
            rounded
            dense
            @click="gotoNotifications()"
          >
            <q-icon
                name="fa-light fa-arrow-up-right-from-square"
                color="blue-grey"
                size="20px" 
                class="cursor-pointer"
            />
          </q-btn>
          <!-- Close icon -->
          <q-btn
            unelevated
            rounded
            dense
            @click="$eventBus.$emit('toggleMasterDrawer', 'notification')"
          >
            <q-icon 
              name="fa-light fa-times" 
              color="blue-grey" 
              size="20px" 
              class="cursor-pointer"
            />
          </q-btn>
        </div>
      </div>
    </div>
    <!--Separator-->    
    <div class="tw-flex tw-justify-end q-my-md">
      <mark-all-as-read
        @marked="() => {notifications = []; getData()}"
      />
    </div>    
    <!--Notifications-->    
      <!--Notifications List-->
      <div v-for="notification in notificationsData.slice(0, 6)" :key="notification.id">
        <notification-card
          :notification="notification"
          :icon="getIcon(notification)"
          :icon-color="getIconColor(notification)"
          :small-icon="true"          
        />
        <q-separator :spaced="'10px'" v-if="!lastItem(notification)"/>
      </div>
      <!--Inner loading-->
      <inner-loading :visible="loading"/>    
  </div>
</template>

<script>
import baseService from '@imagina/qcrud/_services/baseService'
import notificationCard from '@imagina/qnotification/_components/notificationCard.vue'
import markAllAsRead from '@imagina/qnotification/_components/markAllAsRead.vue'

export default {
  beforeDestroy() {
    this.$eventBus.$off('inotification.notifications.new')
  },
  props: {},
  components: {
    notificationCard, 
    markAllAsRead
  },
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
        page: 1,
        perPage: 6,
        lastPage: -1
      },
      sourceSettings: null
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
    },
  },
  methods: {
    async init() {
      console.log('init')
      this.listenEvents()
      await this.getSources()
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
            page: this.pagination.page,
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

    gotoNotifications(){
      if(this.$route.name != 'notification.admin.notificationIndex'){
        this.$router.push({name: 'notification.admin.notificationIndex'})
      } 
    },

    getIcon(notification){
      return this.sourceSettings[notification.source] ? this.sourceSettings[notification.source].icon : 'fa-light fa-bell'
    },

    getIconColor(notification){
      return this.sourceSettings[notification.source] ? this.sourceSettings[notification.source].color : '#2196f3'
    },

    getSources(){
      return new Promise((resolve, reject) => {
        this.loading = true
        //Request Params
        let requestParams = {
          refresh: true,
          params: {filter: {allTranslations: true, configNameByModule: 'config.notificationSource'}}
        }
        //Request
        baseService.index('apiRoutes.qsite.configs', requestParams).then(response => {
          for (const [key, value] of Object.entries(response.data)) {
            if(value != null){
              this.sourceSettings = {...this.sourceSettings, ...response.data[key]}
            }
          }          
          
          this.loading = false
          resolve(true)
        }).catch(error => {
          this.loading = false
          this.$apiResponse.handleError(error, () => {
            resolve(error)
          })
        })
      })
    }, 
    lastItem(notification){
      const last = this.notifications[this.notifications.length - 1]
      return last.id == notification.id
    }  
  }
}
</script>
<style lang="stylus">
#drawerNotificationsComponent
  background-color: rgb(255, 255, 255);
  border: 2px solid #e2e2e2;
  border-radius: 8px;
  height: auto;
  margin-top: 50px;
  margin-right: 10px
  padding 20px;
  position: fixed;
  right: 0;
  width: 300px;
  z-index: 99999;  
</style>
