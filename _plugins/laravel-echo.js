import { eventBus } from 'src/plugins/utils'
import Echo from "laravel-echo"
import Pusher from "pusher-js"
import crud from 'modules/qcrud/_services/baseService'

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
      //if (!window.location.href.includes("localhost")) {
        this.echo = new Echo({
          broadcaster: 'pusher',
          key: this.keys.pusherAppKey,
          cluster: this.keys.pusherAppCluster,
          encrypted: this.keys.pusherAppEncrypted,
        });
      //}
    }
  }

  //Open default channels laravel echo
  openChannel() {
    if (process.env.CLIENT && this.echo) {
      this.echo.leave('imagina.notifications')//Close channel
      console.log("[NOTIFICATION] Channel 'imagina.notifications' was opened")
      //Open channel
      this.echo.channel('imagina.notifications')
        .listen(`.notification.new.${this.userId}`, (response) => {
          //Bell notification
          if (!response.isAction) response.frontEvent = {...response, name: 'inotification.notifications.new'}
          //Custom event from backend
          if (response.frontEvent && response.frontEvent.name) {
            eventBus.$emit(response.frontEvent.name, response.frontEvent)
          }
        })
    }
  }
}
