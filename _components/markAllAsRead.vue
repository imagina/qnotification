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
import services from 'modules/qnotification/services'
export default {

  props: {},
  components: {},
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
      services.markAllAsRead().then(() => {
        this.$emit('marked')
        this.loading = false
      })
    }
  }
}
</script>
<style scoped>
.notification-mark-all-as-read {
  border: 1px solid rgba(0, 13, 71, 0)
}

.notification-mark-all-as-read:hover {
  border: 1px solid rgba(0, 13, 71, 0.15)
}
</style>
