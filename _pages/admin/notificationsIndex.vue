<template>
    <q-page id="notificationsIndex">
      <!--Content-->
      <div id="notificationsIndexTitle" class="row q-col-gutter-y-sm full-width items-center justify-between q-mt-md">
      <!--Title-->
        <div class="row text-primary text-weight-bold ellipsis title-content items-center">
          <label style="font-size: 20px;">Notifications</label>
        </div>
      </div>
      <!-- tabs -->      
      <div class="row q-col-gutter-sm q-mt-md">
        <div class="col-xs-12 col-sm-12 col-md-6">
          <q-tabs
            v-model="filters.tab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="left"
            no-caps
            narrow-indicator
            style="align-items: center;"            
          >
            <q-tab v-for="(tab, index) in tabs" :key="index" :name="tab.name"  :label="tab.label" />             
          </q-tabs>
        </div>
        <!--filters-->
        <div class="col-xs-12 col-sm-9 col-md-4">
          <div class="tw-flex tw-gap-2">
            <dynamic-field v-for="(field, keyField) in formFields" :key="keyField" :field="field"
                                      v-model="filters[keyField]" class=""/> 
          </div>       
        </div>
        <div class="col-xs-12 col-sm-3 col-md-2">
          <div class="tw-flex-1">
            <div class="tw-flex tw-justify-end">
              <q-btn
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
          </div>            
        </div> 
      </div>      
      <!-- notifications-->
      <div class="row"">
        <div class="col-12" v-if="notifications.length > 0">
          <div v-for="(notification, index) in notifications" :key="index">
            <q-item v-ripple>
              <q-item-section avatar>
                <q-icon :name="notification.icon" color="black" size="24px"></q-icon>
              </q-item-section>                

              <q-item-section top>
                <q-item-label lines="1">
                  <span class="text-weight-medium text-weight-bold">{{notification.title}}</span>                    
                </q-item-label>
                <q-item-label>
                  <div class="text-body2" v-html="notification.message">
                  </div>                    
                  <div>
                    Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias desde el año 1500, cuando un impresor (N. del T. persona que se dedica a la imprenta) desconocido usó una galería de textos y los mezcló de tal manera que logró hacer un libro de textos especimen. No sólo sobrevivió 500 años
                  </div>
                </q-item-label>
                <q-item-label lines="1">
                  <span class="text-weight-small text-grey-8">{{ notification.timeAgo }}</span>                    
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
            <q-separator spaced inset />
          </div>
        </div>
        <div class="col-12" v-else>
          <div class="tw-h-64 tw-content-center tw-justify-center"  >          
              <not-result />
          </div>
        </div>
      </div>
           
      <!--pagination -->
      
        
      <div class="q-pa-xl flex flex-center">
          <q-pagination
            v-model="pagination.currentPage"
            v-show="pagination.lastPage > 1 && !loading"
            :max="pagination.lastPage >= 5 ? 5 : pagination.lastPage"
            direction-links
          />
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
    watch: {
      'pagination.currentPage' : {
        handler: function(newValue) {
          this.getNotifications()            
        },
        deep: true
      }, 
      'filters' : {
        handler: function(newValue) {
          this.getNotifications()            
        },
        deep: true
      }, 
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
        formFields: {
          date: {
            type: 'date',
            props: {
              clearable: true,
              label: `${this.$tr('isite.cms.form.date')}*`,
              size: 'sm'
            }
          },
          search: {
            type: 'search',
            props: {
              clearable: true
            }
          }
          

      },
        filters: {
          tab: 'all',
          date: null,
          time: null,        
        }, 
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
        pagination: {
          currentPage: 1, 
          lastPage: 1, 
          perPage: 10,
          total: 0
        }
      }
    },
    computed: {      
      isMobile() {
        return this.$q.platform.is.mobile
      },
      filterStyle(){
        return this.$q.platform.is.mobile ? 'margin-top:20px' :  "position: absolute;right: 0;z-index: 999;top: 0;margin-top: 30px;"
      },      
      groupBy(){
        if(this.notifications.length > 0){
          const objs = Object.groupBy(this.notifications, (notification) => notification?.source)  
          return objs
        }
        return  []
      },
    },
    methods: {

      init(){
        this.getNotifications()
      },
      
      //Get notifications
      getNotifications() {
        this.loading = true

        let requestParams = {
          refresh: true,
          params: {
            take: this.pagination.perPage,
            page: this.pagination.currentPage,
            filter: {
              me: true,
              type: 'broadcast',
              order: {
                field: 'id', 
                way: 'desc'
              }
            
            }
          }
        }
        
        /* isread*/
        if(this.filters.tab != 'all'){          
          requestParams.params.filter['isRead'] = this.filters.tab == 'read' ? true : false
        }

        if(this.filters.date){
          requestParams.params.filter['date'] = this.$moment(this.filters.date).format('YYYY-MM-DD 00:00:00')
        }

        if(this.filters.search){
          requestParams.params.filter['search'] = this.filters.search
        }
        
        return new Promise((resolve, reject) => {        
          baseService.index('apiRoutes.qnotification.notifications', requestParams).then(response => {
            this.loading = false
            this.pagination.lastPage = response.meta.page.lastPage
            this.pagination.total = response.meta.page.total
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
      markAsRead(notification){
        console.log(notification.id)
        return new Promise((resolve, reject) => {        
          baseService.update('apiRoutes.qnotification.markRead', notification.id, {}).then(response => {            
            let notificationIndex = this.notifications.findIndex(item => item.id == notification.id)
            this.notifications[notificationIndex].isRead = true
            resolve(this.notifications[notificationIndex])
          }).catch(error => {
            this.$apiResponse.handleError(error, () => {
              this.loading = false
            })
          })
        })
      },
      markAllAsRead(){
        this.loading = true
        console.log('markAllAsRead')
        return new Promise((resolve, reject) => {        
          baseService.put('apiRoutes.qnotification.markAllAsRead', {}).then(response => {
            this.loading = false
            resolve(response)
          }).catch(error => {
            this.$apiResponse.handleError(error, () => {
              this.loading = false
            })
          })
        })
      }
    }
  }
  </script>
  <style lang="stylus">
  </style>
  