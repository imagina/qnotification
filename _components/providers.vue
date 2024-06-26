<template>
  <div id="providersAdminPage">
    <!--Content-->
    <div id="contentProviders" class="relative-position">
      <!--Providers list-->
      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-for="(provider, key) in providers" :key="key">
          <q-card class="my-card box box-auto-height" style="padding: 0">
            <q-card-section class="text-h5 text-white row items-center q-py-lg"
                            :style="`background-color: ${provider.color}`">
              <!--Icon-->
              <q-icon :name="provider.icon" class="q-mr-md"/>
              <!--Name-->
              <label>{{ provider.name }}</label>
            </q-card-section>

            <q-card-actions>
              <!--Status-->
              <label :class="`text-${providerStatus(provider).color}`">{{ providerStatus(provider).label }}</label>
              <q-space/>
              <!--Setting-->
              <q-btn outline color="primary" rounded dense no-caps :label="$tr('isite.cms.label.setup')"
                     @click="modal.provider = provider, modal.show = true"/>
            </q-card-actions>
          </q-card>
        </div>
      </div>

      <!--Form provider-->
      <q-dialog v-model="modal.show" no-esc-dismiss no-backdrop-dismiss @hide="modal.form = {}">
        <q-card class="bg-grey-1 backend-page row relative-position">
          <!--Header-->
          <q-toolbar class="text-white" :style="`background-color: ${modal.provider.color}`">
            <q-toolbar-title>
              <!--Icon-->
              <q-icon :name="modal.provider.icon" class="q-mr-md"/>
              <!--Name-->
              <label>{{ modal.provider.name }}</label>
            </q-toolbar-title>
            <q-btn flat v-close-popup icon="fas fa-times"/>
          </q-toolbar>

          <!--Content-->
          <q-card-section class="relative-position col-12">
            <!--Forms-->
            <q-form autocorrect="off" autocomplete="off" ref="formProviderConfig" @submit="saveProviderConfig()"
                    @validation-error="$alert.error($tr('isite.cms.message.formInvalid'))">
              <!--Fields-->
              <template v-for="(field, name) in providerFields" :key="name">
                <dynamic-field
                  :field="field"
                  v-if="!field?.isFakeField"
                  v-model="modal.form[field.name || name]"
                  @enter="$refs.formProviderConfig.submit()"
                />
                <!--Fake Fields-->
                <dynamic-field
                  :field="field"
                  v-else
                  @enter="$refs.formProviderConfig.submit()"
                  v-model="modal.form[getNameFakeField(field)][field.name || name]"
                />
              </template>
            </q-form>
          </q-card-section>

          <!--Footer-->
          <q-toolbar class="q-pa-md">
            <q-toolbar-title></q-toolbar-title>
            <!--Button Save-->
            <q-btn icon="fas fa-save" color="positive" rounded unelevated :label="$tr('isite.cms.label.save')"
                   @click="$refs.formProviderConfig.submit()"/>
          </q-toolbar>

          <!--Inner loading-->
          <inner-loading :visible="modal.loading"/>
        </q-card>
      </q-dialog>

      <!--Inner loading-->
      <inner-loading :visible="loading"/>
    </div>
  </div>
</template>
<script>
import { eventBus } from 'src/plugins/utils'

export default {
  beforeUnmount() {
    eventBus.off('page.data.refresh')
  },
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
      providers: [],
      modal: {
        show: false,
        loading: false,
        provider: false,
        form: {}
      }
    }
  },
  computed: {
    providerFields() {
      let fields = this.modal.provider.fields || {}
      let dataProvider = this.modal.provider.data || {}

      for (var fieldName in fields) {
        let field = fields[fieldName]
        //Add fake field to form
        if (field?.isFakeField) {
          let nameFakeField = this.getNameFakeField(field)
          if (!this.modal.form[nameFakeField]) this.modal.form[nameFakeField] = {}
          //Add fake field value
          if (dataProvider[nameFakeField] && (dataProvider[nameFakeField][fieldName] !== undefined))
            fields[fieldName].value = dataProvider[nameFakeField][fieldName]
        }
        //Add data to field value
        else {
          fields[fieldName].value = dataProvider[fieldName] || field.value || null
        }
      }

      return fields
    }
  },
  methods: {
    init() {
      //Get providers
      this.getProviders()
      //Listen refresh page
      eventBus.on('page.data.refresh', () => this.getProviders(true))
    },

    //Get providers
    getProviders(refresh = false) {
      return new Promise((resolve, reject) => {
        this.loading = true//Loading

        // Request data
        let requestData = {refresh: refresh}

        //Request
        this.$crud.index('apiRoutes.qnotification.providers', requestData).then(response => {
          this.providers = response.data
          this.loading = false
          resolve(response.data)
        }).catch(error => {
          this.$apiResponse.handleError(error, () => {
            this.loading = false
            reject(error)
          })
        })
      })
    },

    //Return name fakeField
    getNameFakeField(field) {
      return (typeof field?.isFakeField == 'string') ? field?.isFakeField : 'options'
    },

    //Return config to show provider status
    providerStatus(provider) {
      //Default response [Disabled]
      let response = {
        color: 'red',
        label: this.$tr('isite.cms.label.disabled')
      }

      //If prvider is enabled
      if (provider && provider.data && parseInt(provider.data.status))
        response = {
          color: 'green',
          label: this.$tr('isite.cms.label.enabled')
        }

      //Response
      return response
    },

    //Save config provider
    saveProviderConfig() {
      this.modal.loading = true
      let provider = this.$clone(this.modal.provider)//Provider
      //Form data
      let formData = this.$clone({...this.modal.form, systemName: provider.systemName, name: provider.name})
      let providerId = (provider.data && provider.data.id) ? provider.data.id : false//Provider ID

      //Method after save provider
      const afterSaveProvider = () => {
        //Get providers data
        this.getProviders(true)
        //Order modal
        this.modal.show = false
        this.modal.loading = false
      }

      //update provider
      if (providerId) {
        //Request
        this.$crud.update('apiRoutes.qnotification.providers', providerId, formData).then(response => {
          afterSaveProvider()//Get providers data
          this.$alert.info({message: this.$tr('isite.cms.message.recordCreated')})//Show message
        }).catch(error => {
          this.modal.loading = false
          this.$alert.error({message: this.$tr('isite.cms.message.recordNoUpdated')})
        })
      }
      //Create provider
      else {
        //Request
        this.$crud.create('apiRoutes.qnotification.providers', formData).then(response => {
          afterSaveProvider()//Get providers data
          this.$alert.info({message: this.$tr('isite.cms.message.recordCreated')})//Show message
        }).catch(error => {
          this.modal.loading = false
          this.$alert.error({message: this.$tr('isite.cms.message.recordNoCreated')})
        })
      }
    }
  }
}
</script>
<style lang="sass">
</style>
