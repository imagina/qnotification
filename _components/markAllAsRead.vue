<template>
  <q-btn          
    rounded
    dense
    unelevated
    no-caps
    size="md"
    class="notification-mark-all-as-read"
    @click="markAllAsRead()"
    :label="$tr('notification.cms.markAllAsRead')"
    :loading="loading"
  />
</template>
  
  <script>
  import baseService from '@imagina/qcrud/_services/baseService'  
  export default {
  
    props: {},
    components: {},
    mounted() {
      this.$nextTick(function () {})
    },
    data() {
      return {
        loading: false
      }
    },
    computed: {
    },
    methods: {
      markAllAsRead(){
        this.loading = true
        return new Promise((resolve, reject) => {        
          baseService.put('apiRoutes.qnotification.markAllAsRead', {}).then(response => {            
            this.$emit('marked')
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
    .notification-mark-all-as-read {
      border: 1px solid rgba(0, 13, 71, 0)     
    }

    .notification-mark-all-as-read:hover {
      border: 1px solid rgba(0, 13, 71, 0.15)
    }
  </style>
  