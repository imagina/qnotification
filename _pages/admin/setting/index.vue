<template>
  <q-page id="notificationsConfigPage">
    <!--Content-->
    <div id="contentConfig" class="row q-col-gutter-y-xl">
      <!--Providers-->
      <div id="contentProviders" class="col-12">
        <!--Page Actions-->
        <div class="box box-auto-height q-mb-md">
          <page-actions :title="$trp('isite.cms.label.provider')"/>
        </div>
        <!--Component-->
        <providers/>
      </div>
      <!--Rules-->
      <div id="contentRules" class="col-12" v-if="false">
        <!--Title-->
        <div class="text-h6 text-grey-9">
          <q-icon name="fas fa-directions" class="q-mr-xs"/>
          {{ $trp('notification.cms.label.rule') }}
        </div>
        <q-separator class="q-mb-md q-mt-xs"/>
        <!--Component-->
        <rules/>
      </div>
    </div>
  </q-page>
</template>
<script>
//Components
import providers from 'modules/qnotification/_components/providers'
import rules from 'modules/qnotification/_components/rules'

export default {
  props: {},
  components: {providers, rules},
  watch: {},
  mounted() {
    this.$nextTick(function () {
    })
  },
  data() {
    return {}
  },
  computed: {},
  methods: {}
}
</script>
<style lang="sass">
</style>
