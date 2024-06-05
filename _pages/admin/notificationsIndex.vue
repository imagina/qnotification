<template>
    <q-page id="notificationsIndex">
      <!--Content-->
      <div id="notificationsIndexTitle" class="row q-col-gutter-y-sm full-width items-center justify-between">
      <!--Title-->
        <div class="row text-primary text-weight-bold ellipsis title-content items-center">
          <label style="font-size: 20px;">Notifications</label>
        </div>
      </div>

      <div class="row justify-evenly">
        <div class="col-9">          
          <q-tabs
            v-model="tabModel"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="left"
            no-caps
            narrow-indicator
          >
            <q-tab v-for="(tab, index) in tabs" :name="tab.name"  :label="tab.label" />
          </q-tabs>           
        </div>
        <div class="col-2 justify-end">
          <q-btn 
            unelevated
            rounded 
            no-caps 
            @click="() => markAllAsRead()"
            label="Mark all as read"
          />
        </div>
      </div>
      <div class="row col-12">
        <q-tab-panels v-model="tabModel">
          <q-tab-panel v-for="(tab, index) in tabs" :name="tab.name">
            
            {{ groupBy }}

          </q-tab-panel>
        </q-tab-panels>
      </div>
      <inner-loading :visible="loading"/>      
    </q-page>
  </template>
  <script>
  //Components
  
  import baseService from '@imagina/qcrud/_services/baseService'
  
  export default {
    props: {},
    components: {},
    watch: {},
    mounted() {
      this.$nextTick(function () {        
        this.init()
      })
    },
    data() {
      return {
        loading: false,
        notifications: [],
        tabs: [
          {
            name: 'all', 
            label: 'All'
          }, 
          {
            name: 'read', 
            label: 'Read'
          },
          {
            name: 'unread', 
            label: 'Unread'
          }
        ], 
        tabModel: '',
        pagination: {
          perPage: 20, 
          page: 0
        }
      }
    },
    computed: {
      filterNotifications(){
        switch (this.tabModel) {
          case  this.tabs[1].name : //read
            return this.notifications.filter((e) => e.isRead == true)
            break;
          case  this.tabs[2].name : //unread
            return this.notifications.filter((e) => e.isRead == false)
            break;
          default: //all
            return this.notifications
          }
      },
      groupBy(){
        if(this.notifications.length > 0){
        const objs = Object.groupBy(this.notifications, (notification) => notification?.source || false)  
        return objs
        }
        return  []
      },
    },
    methods: {

      init(){
        this.tabModel = this.tabs[0].name
        this.getNotifications()
      },
        //Get notifications

      getNotifications() {
        this.loading = true

        let requestParams = {
          refresh: true,
            params: {
              take: this.pagination.perPage,
              page: (this.pagination.page + 1),
              /*
              filter: {
                me: true,
                type: 'broadcast'
              }
              */
          }
        }
        return new Promise((resolve, reject) => {        
          baseService.index('apiRoutes.qnotification.notifications', requestParams).then(response => {
            this.loading = false
            resolve(
              this.notifications = response.data
              //data: response.data.sort((a, b) => b.id - a.id)
            )
          }).catch(error => {
            this.$apiResponse.handleError(error, () => {
              this.loading = false
            })
          })
        })
      },
      markAllAsRead(){
        console.log('markAllAsRead')
      }

    /*
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
      */  
    }
  }
  </script>
  <style lang="stylus">
  </style>
  