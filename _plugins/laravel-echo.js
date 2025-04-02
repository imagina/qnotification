import eventBus from '@imagina/qsite/_plugins/eventBus'
import Echo from "laravel-echo"
import Pusher from "pusher-js"
import crud from '@imagina/qcrud/_services/baseService'
import helper from '@imagina/qsite/_plugins/helper'
import alert from '@imagina/qsite/_plugins/alert'

export default class echo {
  constructor() {
  }

  //Init
  init(store) {
    return new Promise(async resolve => {
      if (process.env.CLIENT) {
        this.echo = false//Default
        this.userId = store.state.quserAuth.userId//Get user Id
        this.keys = await this.getKeys()//Get keys pusher
        await this.doConnection()//Do connection
        this.openChannel()//Open channel
        resolve(true)
      } else {
        resolve(false)
      }
    })
  }

  //Get pusher data
  getKeys() {
    return new Promise((resolve, reject) => {
      let requestData = {refresh: true}// Request data
      if (!this.userId) return resolve(false)//Validate sesion

      //Request
      crud.index('apiRoutes.qnotification.providers', requestData).then(response => {
        //Validate response
        if (!Array.isArray(response.data)) return resolve(false)//Get pusher keys
        let pusherData = response.data.find(item => item.name == 'Pusher')
        //validate response
        if (pusherData && pusherData.data && pusherData.data.fields) {
          let keys = pusherData.data.fields
          if (keys.pusherAppKey && keys.pusherAppCluster && keys.pusherAppEncrypted) resolve(keys)
          else resolve(false)
        }
      }).catch(error => {
        console.error(error)
        reject(error)
      })
    })
  }

  //Connect laravel echo
  async doConnection() {
    if (process.env.CLIENT && this.keys) {
      this.echo = new Echo({
        broadcaster: 'pusher',
        key: this.keys.pusherAppKey,
        cluster: this.keys.pusherAppCluster,
        encrypted: this.keys.pusherAppEncrypted,
      });
    }
  }

  //Open default channels laravel echo
  openChannel() {
    if (process.env.CLIENT && this.echo) {
      this.echo.leave('imagina.notifications')//Close channel
      let channelName = 'imagina.notifications'
      let eventName = `notification.new.${this.userId}`
      //Open channel
      this.echo.channel(channelName)
        .listen(`.${eventName}`, (response) => {
          const showInBell = response.setting && response.setting.saveInDatabase
          //Bell notification
          if (showInBell){
            eventBus.$emit('inotification.notifications.new', response)
          }
          //Custom event from backend
          if (response.frontEvent && response.frontEvent.name) {
            eventBus.$emit(response.frontEvent.name, response.frontEvent)
          }
          //Custom event to show important notification
          if (response.options && response.options.isImportant) {
            alert.warning({
              mode: 'modal',
              message: response.message,
              icon: response.icon,
              actions: [{
                label: 'ok',
                color: 'green',
                handler: () => {
                  if (response.link) helper.openExternalURL(response.link, true)
                }
              }],
            })
          }
        })
      //Initialize the SW
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'initializePusher',
          data: {...this.keys, channelName, eventName},
        });
      }
      console.log("[NOTIFICATION] Channel 'imagina.notifications' was opened")
    }
  }
}
