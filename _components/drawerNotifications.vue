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
    <div class="tw-flex tw-justify-end">
      <q-btn
        v-if="false"
          rounded
          dense
          unelevated
          no-caps 
          text-color="primary"
          size="md"
          style="border: 1px solid rgba(0, 13, 71, 0.15)"
          @click="markAllAsRead()"
          label="Mark all as read"                
        />   
    </div>    
    <!--Notifications-->
    
      <!--Notifications List-->
      <div v-for="notification in notificationsData" :key="notification.id" class="q-px-sm">        
        <notification-card
          :notification="notification"
          :icon="getIcon(notification)"
          :icon-color="getIconColor(notification)"            
        />
      </div>
      <!--Actions-->
      <div class="text-center q-py-md" v-if="(this.pagination.page == this.pagination.lastPage) ? false : true">
        <!--Load more notifications-->
        <q-btn unelevated color="green" rounded no-caps :label="$trp('isite.cms.label.showMore')" @click="gotoNotifications()"/>
      </div>
      <!--Inner loading-->
      <inner-loading :visible="loading"/>    
  </div>
</template>

<script>
import baseService from '@imagina/qcrud/_services/baseService'
import notificationCard from '@imagina/qnotification/_components/notificationCard.vue'
export default {
  beforeDestroy() {
    this.$eventBus.$off('inotification.notifications.new')
  },
  props: {},
  components: {
    notificationCard
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
        page: 0,
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
    }
  },
  methods: {
    async init() {
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

    gotoNotifications(){
      if(this.$route.name == 'notification.admin.notificationIndex'){
        //this.$emit('toggleMasterDrawer', 'notification')
      } else {
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



    /*
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
    */
   /* source*/
   
   
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
