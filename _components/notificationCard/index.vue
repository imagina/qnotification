<template>
  <div id="pageId">
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import controller from 'src/modules/qnotification/_components/notificationCard/controller'

export default defineComponent({
  props: {},
  components: {},
  setup(props, {emit}) {
    return controller(props, emit)
  }
})
</script>
<style lang="scss">
</style>
