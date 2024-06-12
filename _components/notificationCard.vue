<template>
  <div>
  <q-item clickable dense class="no-margin q-py-none q-pl-none" @click="openModal()">
    <q-item-section avatar>
      <div v-if="smallIcon" class="flex flex-center notification-notification-icon-small" :style="{borderColor: iconColor }">
        <q-icon :name="icon" :style="{color: iconColor, fontSize: '20px' }" />
      </div>
      <div v-else class="flex flex-center notification-notification-icon" :style="{borderColor: iconColor }">
        <q-icon :name="icon" :style="{color: iconColor, fontSize: '32px' }" />
      </div>
    </q-item-section>                

    <q-item-section top>
      <q-item-label lines="1">
        <span class="text-weight-medium text-weight-bold">{{notification.title}}</span>                    
      </q-item-label>
      <q-item-label lines="2">
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
      <div class="tw-flex-1 tw-content-end q-pa-sm">
        <q-btn
          class="notification-mark-as-read"
          rounded
          dense
          unelevated
          no-caps                   
          size="md"                  
          @click.stop="markAsReadHandler()"
          label="Mark as read"
          :loading="loading"
        />
      </div>
    </q-item-section>    
  </q-item>
<!------ dialog ------->
  <q-dialog v-model="dialog">
    <q-card rounded style="width: 600px;">
      <q-card-section>
        <div class="row justify-between items-center">
          <div class="text-subtitle1 row items-center">
            <q-icon name="fa-light fa-bell" color="blue-grey" size="20px" class="q-mr-sm"/>
            <label>{{ $tr('isite.cms.label.notification', {capitalize: true}) }}</label>
          </div>
          <!-- Close icon -->
          <q-icon name="fas fa-times" color="blue-grey" size="23px" class="cursor-pointer"  @click="closeModal()"/>
        </div>
      </q-card-section>
      <q-card-section>
        <!--notification-->
        <q-item class="no-margin no-padding">
          <q-item-section avatar top>
            <div class="flex flex-center notification-notification-icon" :style="{borderColor: iconColor }">
              <q-icon :name="icon" :style="{color: iconColor, fontSize: '32px' }" />
            </div>
          </q-item-section>                

          <q-item-section top>
            <q-item-label>
              <span class="text-weight-medium text-weight-bold">{{notification.title}}"</span>                    
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
          class="notification-notification-image img-as-bg"
          :style="`background-image: url('${imageUrl}')`">
        </div>        
      </q-card-section>
    <q-card-section>
      <q-separator class="q-my-sm"/>
      <q-card-actions align="right" v-if="notification.link">
        <q-btn 
          label="Open link"
          rounded
          no-caps
          unelevated
          color="green"          
          @click="goToLink()"            
        />
      </q-card-actions>
    </q-card-section>
    </q-card>
  </q-dialog>
  </div>
</template>
<script>
//Components
import baseService from '@imagina/qcrud/_services/baseService'
  export default {
    props: {
      notification: {},
      icon: '', 
      iconColor: '',
      smallIcon: false
    },
    components: {},
    watch: {},
    mounted() {
      this.$nextTick(function () {        
        this.init()
      })
    },
    data() {
      return {
        dialog: false, 
        loading: false,
      }        
    },
    computed: {
      imageUrl(){
        return this.notification?.mediaFiles?.mainimage?.id ? this.notification?.mediaFiles?.mainimage?.mediumThumb : false
      }
    },
    methods: {

      async init(){        
      },
      markAsRead(){        
        this.notification.isRead = true
        return new Promise((resolve, reject) => {        
          baseService.update('apiRoutes.qnotification.markRead', this.notification.id, {}).then(response => {            
            resolve(this.notification)
          }).catch(error => {
            this.$apiResponse.handleError(error, () => {
              this.notification.isRead = false
              this.loading = false
            })
          })
        })
      },
      goToLink(){
        this.$helper.openExternalURL(this.notification.link, true)//open expernal URL
      }, 
      openModal(){
        this.dialog = true;
        if(this.notification.isRead == false){
          this.notification.isRead = true          
          this.markAsRead()
        }
      }, 
      closeModal(){
        this.dialog = false
        this.$emit('read')
      },
      markAsReadHandler(){
        this.loading = true
        this.markAsRead().then(() => {
          this.notification.isRead = true
          this.loading = false  
          this.$emit('read')
        })        
      }
    },
  }
  </script>
  <style lang="stylus">
    .notification-notification-icon {
      border-radius: 8px;
      width: 48px;
      height: 48px;
      border: 2px;
      border-style: solid;
    }

    .notification-notification-icon-small {
      border-radius: 8px;
      width: 36px;
      height: 36px;
      border: 2px;
      border-style: solid;
    }

    .notification-notification-image {
      height 250px;
      width 100%;
      border-radius 16px;
    }

    .notification-mark-as-read {
      color: rgb(117, 117, 117);
      border: 1px solid rgba(0, 13, 71, 0);
    }

    .notification-mark-as-read:hover {
      color: rgba(0, 0, 0, 0.8);
      border: 1px solid rgba(0, 13, 71, 0.15);
    }
  </style>
  