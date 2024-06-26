<template>
  <div id="notificationsRulesComponent">
    <!--Content-->
    <div id="contentRulesConfig">
      <!--List rules-->
      <crud :crud-data="import('modules/qnotification/_crud/rules')" @create="openForm()" @update="openForm"/>
    </div>

    <!--Dialog Form Rules notification-->
    <q-dialog id="modalFormRulesConfig" class="modal-form-notification-rules"
              v-model="modal.show" no-esc-dismiss no-backdrop-dismiss @show="resetModal()">
      <q-card>
        <!--Header-->
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title>
            <label v-if="!modal.item">{{$tr('notification.cms.newRule')}}</label>
            <label v-else>{{$tr('notification.cms.updateRule')}} ID: {{modal.item.id}}</label>
          </q-toolbar-title>
          <q-btn flat v-close-popup icon="fas fa-times"/>
        </q-toolbar>

        <!--Form-->
        <q-card-section>
          <!--Forms-->
          <q-form autocorrect="off" autocomplete="off" ref="formRules" class="row"
                  @submit="modal.item ? updateRule() : createRule()"
                  @validation-error="$alert.error($tr('isite.cms.message.formInvalid'))">
            <!--Form fields-->
            <div class="row col-12 q-col-gutter-md">
              <dynamic-field v-for="(field, name) in formFields" :key="name" v-model="form[field.name || name]"
                             :field="field" class="col-12 col-md-6"/>
            </div>
            <q-separator class="q-mb-md"/>
            <!--Events-->
            <div class="col-12">
              <!--Description-->
              <div class="q-mb-sm">
                {{$tr('notification.cms.label.event')}}
                <div class="text-caption text-grey-8">{{$tr('notification.cms.message.chooseEventCategory')}}</div>
              </div>
              <!--Entities-->
              <div class="q-gutter-sm q-mb-sm">
                <q-btn v-for="(entity, key) in entitiesOptions" :key="key" padding="xs sm" no-caps
                       unelevated :label="entity.label" @click="form.entityName = entity.value, form.eventPath = []"
                       :color="(form.entityName == entity.value) ? 'primary' : 'grey-7'"
                       :outline="(form.entityName == entity.value) ? false : true"/>
              </div>
              <!--Events by category-->
              <q-scroll-area id="eventsContent" style="height: 100px; width: 100%;" visible>
                <q-item v-for="(event, key) in eventsOptions" :key="key" v-ripple>
                  <q-item-section>
                    <q-checkbox v-model="form.eventPath" :val="event.value" :label="event.label" size="xs"/>
                  </q-item-section>
                </q-item>
              </q-scroll-area>
            </div>
            <q-separator class="q-my-md"/>
            <!--Conditions-->
            <div class="col-12">
              <!--Description-->
              <div class="q-mb-sm">
                {{$trp('notification.cms.label.condition')}}
                <div class="text-caption text-grey-8">{{$tr('notification.cms.message.conditions')}}</div>
              </div>
              <!--Fields-->
              <div class="row col-12 q-col-gutter-md">
                <div class="col-12 col-sm-6 col-md-3" v-for="(field, name) in conditionsFields" :key="name">
                  <!--Parent title field-->
                  <div class="text-caption"><b>{{field.props ? field.props.label : ''}}</b></div>
                  <!--Single Field-->
                  <dynamic-field v-if="!field.children" :field="field" v-model="form.conditions[field.name || name]"/>
                  <!--Child field-->
                  <dynamic-field v-else v-for="(childField, nameChild) in field.children" :key="nameChild"
                                 v-model="form.conditions[field.name || name][childField.name | nameChild]"
                                 :field="childField"/>
                </div>
              </div>
            </div>
            <q-separator class="q-my-md"/>
            <!--Provider settings-->
            <div class="col-12">
              <!--Description-->
              <div class="q-mb-sm">
                {{$trp('notification.cms.message.settingProviders')}}
              </div>
              <!--Providers-->
              <div class="q-gutter-sm q-mb-sm">
                <q-btn v-for="(provider, key) in providersOptions" :key="key" padding="xs sm" no-caps
                       unelevated :label="provider.label" @click="form.providerName = provider.value"
                       :color="(form.providerName == provider.value) ? 'primary' : 'grey-7'"
                       :outline="(form.providerName == provider.value) ? false : true"/>
              </div>
              <!--Fields-->
              <div class="row col-12 q-col-gutter-md">
                <dynamic-field v-for="(field, name) in providersFields" :key="name" :field="field"
                               v-model="form.settings[form.providerName][field.name || name]" class="col-12 col-md-6"/>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <!--Footer-->
        <q-toolbar class="q-pa-md">
          <q-toolbar-title></q-toolbar-title>
          <!--Button Save-->
          <q-btn icon="fas fa-save" color="positive" rounded unelevated
                 v-if="!modal.item" :label="$tr('isite.cms.label.save')"
                 @click="$refs.formRules.submit()"/>
          <!--Button Update-->
          <q-btn :label="$tr('isite.cms.label.update')" icon="fas fa-pen" color="positive" rounded unelevated
                 @click="$refs.formRules.submit()" v-else/>
        </q-toolbar>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { eventBus } from 'src/plugins/utils'

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
        events: [],
        providers: [],
        modal: {
          item: false,
          show: false,
          loading: false
        },
        form: {}
      }
    },
    computed: {
      //Default data form
      defaultDataForm() {
        return this.$clone({
          name: null,
          status: true,
          entityName: null,
          eventPath: [],
          conditions: {},
          settings: {},
          providerName: null
        })
      },
      //From fields to rule config
      formFields() {
        return {
          name: {
            value: null,
            type: 'input',
            props: {
              label: `${this.$tr('isite.cms.form.name')}*`,
              rules: [val => !!val || this.$tr('isite.cms.message.fieldRequired')]
            }
          },
          status: {
            value: '1',
            type: 'select',
            props: {
              label: `${this.$tr('isite.cms.form.status')}*`,
              rules: [val => !!val || this.$tr('isite.cms.message.fieldRequired')],
              options: [
                {label: this.$tr('isite.cms.label.enabled'), value: '1'},
                {label: this.$tr('isite.cms.label.disabled'), value: '0'},
              ]
            }
          }
        }
      },
      //Return selected entity
      selectedEntity() {
        if (!this.form.entityName) return false//Default response
        //Get entity
        return this.events.find(event => event.entityName == this.form.entityName)
      },
      //Return entities options
      entitiesOptions() {
        return this.events.map(entity => {
          return ({label: entity.title, value: entity.entityName})
        })
      },
      //Return events options
      eventsOptions() {
        //Default response
        if (!this.selectedEntity) return []
        //Return event options
        return this.selectedEntity.events.map(event => {
          return ({label: event.title, value: event.path})
        })
      },
      //Return Conditions fields
      conditionsFields() {
        if (!this.selectedEntity) return {}

        //Add parent values to form conditions
        for (var fieldName in this.selectedEntity.conditions) {
          let field = this.selectedEntity.conditions[fieldName]
          if (field.children) this.form.conditions[fieldName] = {}
        }

        return this.selectedEntity.conditions
      },
      //Return Providers options
      providersOptions() {
        let response = []

        Object.values(this.providers).forEach(provider => {
          response.push({label: provider.name, value: provider.systemName})//Add option
          this.form.settings[provider.systemName] = {}//Add field to form
        })

        return response
      },
      //Return Conditions fields
      providersFields() {
        if (!this.form.providerName) return []
        let providerSelected = Object.values(this.providers).find(item => item.systemName == this.form.providerName)
        return providerSelected ? providerSelected.settings : []
      },
    },
    methods: {
      init() {
        this.form = this.$clone(this.defaultDataForm)//Set default data form
        this.getData()//Get data
        eventBus.on('page.data.refresh', () => this.getData(true))//Listen refresh page
      },

      //Get data
      getData(refresh = false) {
        return new Promise(async (resolve, reject) => {
          this.loading = true
          await Promise.all([this.getEvents(refresh), this.getProviders(refresh)])
          this.loading = false
        })
      },

      //Get rules
      getEvents(refresh = false) {
        return new Promise((resolve, reject) => {
          let requestData = {refresh: refresh}// Request data

          //Request
          this.$crud.index('apiRoutes.qnotification.rulesConfig', requestData).then(response => {
            this.events = response.data
            resolve(response.data)
          }).catch(error => {
            this.$apiResponse.handleError(error, () => {
              reject(error)
            })
          })
        })
      },

      //Get providers
      getProviders(refresh = false) {
        return new Promise((resolve, reject) => {
          let requestData = {refresh: refresh}// Request data

          //Request
          this.$crud.index('apiRoutes.qnotification.providers', requestData).then(response => {
            this.providers = response.data
            resolve(response.data)
          }).catch(error => {
            this.$apiResponse.handleError(error, () => {
              reject(error)
            })
          })
        })
      },

      //Reset modal
      resetModal() {
        //Reset modal item
        this.modal.item = false
        //Reset form
        this.form = this.$clone(this.defaultDataForm)
        //Default entity selected
        this.form.entityName = this.events ? this.events[0].entityName : null
        //Default provider selected
        this.form.providerName = this.providers ? Object.values(this.providers)[0].systemName : null
      },

      //Open form rules config
      openForm(item = false) {
        this.modal.item = item ?? false//Set item ID
        this.modal.show = true//Open modal
      },

      //Create rule
      createRule() {

      },

      //Updtae rule
      updateRule() {

      }
    }
  }
</script>
<style lang="scss">
  #modalFormRulesConfig {
    .q-card {
      max-height: calc(100vh - 48px) !important;
      max-width: 850px;

      .q-card__section {
        min-height: 250px;
        max-height: calc(100vh - 176px) !important;
        overflow-y: scroll;
      }
    }

    .q-modal-content {
      max-height: 70vh !important;

      @media screen and (max-width: $breakpoint-sm) {
        max-height: 100vh !important;
      }

      .q-modal-layout {
        .q-layout-header {
          position: absolute !important;
          top: 0;
          width: 100%;
        }

        .q-layout-footer {
          position: absolute !important;
          width: 100%;
          bottom: 0;
        }

        .q-modal-layout-content {
          max-height: 70vh !important;
          padding: 50px 0;

          @media screen and (max-width: $breakpoint-sm) {
            min-height: 100vh !important;
          }
        }
      }
    }

    #eventsContent {
      border: 1px solid $grey-4;
      border-radius: 5px;
      padding: 5px;

      .q-item {
        min-height: 30px;
        height: 32px;
        padding: 0px;
      }

      .q-checkbox {
        min-height: 32px;
      }
    }
  }
</style>
