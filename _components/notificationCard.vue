<template>
  <div>
  <q-item clickable dense class="q-my-sm q-px-none" @click="openModal()">
    <q-item-section avatar>
      <div v-if="smallIcon" class="flex flex-center notification-notification-icon-small" :style="{borderColor: getIconColor }">
        <q-icon :name="getIcon" :style="{color: getIconColor, fontSize: '20px' }" />
      </div>
      <div v-else class="flex flex-center notification-notification-icon" :style="{borderColor: getIconColor }">
        <q-icon :name="getIcon" :style="{color: getIconColor, fontSize: '32px' }" />
      </div>
    </q-item-section>
    <q-item-section top>
      <q-item-label lines="1">
        <span class="text-weight-medium text-weight-bold">{{notification.title}}</span>                    
      </q-item-label>
      <q-item-label lines="2" class="no-margin">
        <div class="text-body2" v-html="notification.message">
        </div>
      </q-item-label>
      <q-item-label caption>
        <span class="text-caption text-grey-8">{{ notification.timeAgo }}
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
          <q-icon name="fa-light fa-times" color="blue-grey" size="23px" class="cursor-pointer"  @click="closeModal()"/>
        </div>
      </q-card-section>
      <q-card-section>
        <!--notification-->
        <q-item class="no-margin no-padding">
          <q-item-section avatar top>
            <div class="flex flex-center notification-notification-icon-big" :style="{borderColor: getIconColor }">
              <q-icon :name="getIcon" :style="{color: getIconColor, fontSize: '48px' }" />
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
          color="green"          
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
  </div>
</template>
<script>
//Components
import services from '@imagina/qnotification/services'
  export default {
    props: {
      notification: {},
      smallIcon: false, 
      sourceSettings: [], 
      showMarkAsRead: false
    },
    components: {},
    watch: {},
    data() {
      return {
        dialog: false, 
        loading: false,
      }        
    },
    computed: {
      getIcon(){
        return this.sourceSettings[this.notification.source] ? this.sourceSettings[this.notification.source].icon : 'fa-light fa-bell'
      },

      getIconColor(){
        return this.sourceSettings[this.notification.source] ? this.sourceSettings[this.notification.source].color : '#2196f3'
      },
      isUnread(){
        return !this.notification.isRead
      },
      imageUrl(){
        return this.notification?.mediaFiles?.mainimage?.id ? this.notification?.mediaFiles?.mainimage?.mediumThumb : false
      }, 
      linkLabel(){
        return this.notification?.options?.linkLabel ? this.notification.options.linkLabel :  this.$tr('notification.cms.openLink')
      }
    },
    methods: {

      async init(){        
      },
      markAsRead(){        
        this.notification.isRead = true
        return new Promise((resolve, reject) => {
          services.markAsRead(this.notification.id).then(response => {            
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
        if(this.isUnread){
          this.$emit('read')
          this.markAsRead(this.notification.id)
        }
      }, 
      closeModal(){
        this.dialog = false
      },
      markAsReadHandler(){
        this.loading = true
        this.notification.isRead = true
        this.markAsRead(this.notification.id).then(() => {
          console.log('marked as read')
          this.loading = false  
          this.$emit('read')
        })        
      }
    },
  }
  </script>
  <style scoped src="../assets/styles/styles.css">
  </style>
  