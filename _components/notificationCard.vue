<template>
  <q-item v-ripple dense>
    <q-item-section avatar top>
      <div class="flex flex-center notifications-notification-icon" :style="{borderColor: iconColor }">
        <q-icon :name="icon" :style="{color: iconColor, fontSize: '24px' }" />
      </div>
    </q-item-section>                

    <q-item-section top>
      <q-item-label lines="1">
        <span class="text-weight-medium text-weight-bold">{{notification.title}}</span>                    
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
    <!-- unread notification -->
    <q-item-section side top v-show="!notification.isRead">              
      <div>
        <q-badge color="blue" rounded />                  
      </div>
      <div class="tw-flex-1 tw-content-end">
        <q-btn
          rounded
          dense
          unelevated
          no-caps                   
          size="md"                  
          @click="markAsRead(notification)"
          label="Mark as read"
        />
      </div>
    </q-item-section>
  </q-item>  
</template>
<script>
//Components
import baseService from '@imagina/qcrud/_services/baseService'
  export default {
    props: {
      notification: {},
      icon: '', 
      iconColor: ''
    },
    components: {},
    watch: {},
    mounted() {
      this.$nextTick(function () {        
        this.init()
      })
    },
    data() {
      return {}        
    },
    computed: {},
    methods: {

      async init(){        
      },      
      markAsRead(notification){
        return new Promise((resolve, reject) => {        
          baseService.update('apiRoutes.qnotification.markRead', notification.id, {}).then(response => {            
            //let notificationIndex = this.notifications.findIndex(item => item.id == notification.id)
            //this.notifications[notificationIndex].isRead = true
            this.notification.isRead = true
            resolve(this.notification)
          }).catch(error => {
            this.$apiResponse.handleError(error, () => {
              this.loading = false
            })
          })
        })
      },
    }
  }
  </script>
  <style lang="stylus">
    .notifications-notification-icon {
      border-radius: 8px;
      width: 40px;
      height: 40px;
      border: 2px;
      border-style: solid;
    }
  </style>
  