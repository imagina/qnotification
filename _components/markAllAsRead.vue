<template>
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
        this.$emit('marked')
        this.loading = false
        return     
        return new Promise((resolve, reject) => {        
          baseService.put('apiRoutes.qnotification.markAllAsRead', {}).then(response => {
            this.loading = false
            this.$emit('marked')
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
  