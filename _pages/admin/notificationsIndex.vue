<template>
  <q-page id="notificationsIndex">
    <!--Content-->
    <div id="notificationsIndexTitle" class="row q-col-gutter-y-sm full-width items-center justify-between q-mt-md">
      <!--Title-->
      <div class="row text-primary text-weight-bold ellipsis title-content items-center">
        <label style="font-size: 20px;">{{ $tr('notification.cms.sidebar.adminGroup') }}</label>
      </div>
    </div>

    <!-- tabs -->
    <div class="row q-my-md">
      <div class="col-xs-12 col-sm-12 col-md-6 q-mb-md">
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
          <q-tab v-for="(tab, index) in tabs" :key="index" :name="tab.value"  :label="tab.label" />
        </q-tabs>
      </div>
      <!--filters-->
      <div class="col-xs-12 col-sm-9 col-md-6">
        <div class="row q-col-gutter-x-sm q-col-gutter-y-md">
          <dynamic-field v-for="(field, keyField) in formFields" :key="keyField" :field="field"
                         v-model="filters[keyField]" class="col-xs-6 col-md-3 "/>

          <div class="col-xs-6 col-md-3">
            <div class="tw-text-center">
              <div class="flex justify-end">
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
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- notifications-->
    <div class="row q-pa-md">
      <div class="col-12" v-if="notifications.length > 0">
        <div style="min-height: 100px">
          <div v-for="(notification, index) in notifications" :key="index">
            <notification-card
              :item-notification="notification"
              :show-mark-as-read="true"
              :source-settings="sourceSettings || {}"
              @read="removeFromUnread(notification)"
              @open-modal="(val) => openModal(val)"
            />
            <q-separator :spaced="'10px'"/>
          </div>
        </div>
        <div class="q-pa-lg flex flex-center">
          <!--pagination -->
          <q-pagination
            v-model="pagination.currentPage"
            v-show="pagination.lastPage > 1 && !loading"
            :max="pagination.lastPage"
            :max-pages="6"
            :ellipses="false"
            :boundary-numbers="false"
            unelevated
            round
            color="blue-grey"
            active-color="primary"
            direction-links
          />
        </div>
      </div>
      <div class="col-12" v-else>
        <div class="tw-h-64 tw-content-center tw-justify-center">
          <not-result v-if="!loading"/>
        </div>
      </div>
    </div>
    <inner-loading :visible="loading"/>
  </q-page>
</template>
<script>
//Components

import services from 'src/modules/qnotification/services'
import notificationCard from 'src/modules/qnotification/_components/notificationCard/index.vue'
import { eventBus } from '../../../../plugins/utils';

export default {
  props: {},
  components: {
    notificationCard
  },
  watch: {
    'pagination.currentPage' : {
      handler: function(newValue) {
        //prevents double call when page resets due tab selection
        if(!this.lockPagination){
          this.getNotifications()
        }
      },
    },
    'filters' : {
      handler: async function(newValue) {
        this.lockPagination = true
        this.pagination.currentPage = 1;
        await this.getNotifications()
        this.lockPagination = false
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
      lockPagination: false,
      loading: false,
      notifications: [],
      formFields: {
        source: {
          value: null,
          type: 'select',
          props: {
            label: this.$tr('notification.cms.type'),
            clearable: true,
            options: [],
            vIf: false
          },
        },
        date: {
          type: 'date',
          props: {
            clearable: true,
            label: this.$tr('isite.cms.form.date'),
            //size: 'sm'
          }
        },
        search: {
          type: 'search',
          props: {
            clearable: true
          }
        },

      },
      filters: {
        tab: 'all',
        date: null,
        time: null,
        source: null
      },
      tabs: [
        {
          value: 'all',
          label: this.$tr('notification.cms.tab.all')
        },
        {
          value: 'read',
          label: this.$tr('notification.cms.tab.read')
        },
        {
          value: 'unread',
          label: this.$tr('notification.cms.tab.unread')
        }
      ],
      pagination: {
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        total: 0
      },
      sourceSettings: null
    }
  },
  computed: {},
  methods: {

    async init(){
      await this.getSources()
      await this.getNotifications()
    },

    getSources(){
      this.loading = true
      services.getSources().then( (sources) => {
        this.sourceSettings = sources
        this.addSourceFilterOptions()
      })
    },

    //add source filter options
    addSourceFilterOptions(){
      for (const [key, value] of Object.entries(this.sourceSettings)) {
        this.formFields.source.props.options.push({label: this.sourceSettings[key]['label'], value: key})
      }
      if(this.formFields.source.props.options.length > 0){
        this.formFields.source.props.vIf = true
      }
    },

    async resetPagination(){
      this.lockPagination = true
      this.pagination.currentPage = 1;
      await this.getNotifications()
      this.lockPagination = false
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
      /* filters */
      if(this.filters.tab != this.tabs[0].value){   //all
        requestParams.params.filter['isRead'] = this.filters.tab == this.tabs[1].value ? true : false //read/unread
      }

      if(this.filters.date){
        requestParams.params.filter['date'] = this.$moment(this.filters.date).format('YYYY-MM-DD 00:00:00')
      }

      if(this.filters.search){
        requestParams.params.filter['search'] = this.filters.search
      }

      if(this.filters.source){
        requestParams.params.filter['source'] = this.filters.source
      }

      return new Promise((resolve, reject) => {
        services.getNotifications(requestParams).then(response => {
          this.loading = false
          this.pagination.lastPage = response.meta.page.lastPage
          this.pagination.total = response.meta.page.total
          resolve(
            this.notifications = response.data
          )
        }).catch(error => {
          this.$apiResponse.handleError(error, () => {
            this.loading = false
          })
        })
      })
    },
    removeFromUnread(notification){
      if(this.filters.tab == this.tabs[2].value){ //unread tab
        this.notifications = this.notifications.filter((e) => {
          return e.id !== notification.id
        })
      }

      if(this.notifications.length == 0){
        this.getNotifications()
      }
    },
    markAllAsRead() {
      services.markAllAsRead().then(() => {
        this.resetPagination()
      });
    },
    openModal(notification) {
      eventBus.emit('imagina.notification.open', notification)
    },
  }
}
</script>
<style>
</style>
