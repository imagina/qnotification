import laravelEcho from '@imagina/qnotification/_plugins/laravel-echo'
import alert from '@imagina/qsite/_plugins/alert'

export default class NotificationPlugin {
  constructor(store) {
    this.echo = false //Default attribute to laravel echo
    this.doConnectionLaravelEcho(store)//Do connection with laravel echo
    //this.requestNavigatorPermission()//Request navigator permission
  }

  //Connect to laravel echo
  async doConnectionLaravelEcho(store) {
    if (process.env.CLIENT) {
      let connection = new laravelEcho(store)
      await connection.init(store)
      if (connection && connection.echo) this.echo = connection.echo
    }
  }

  //Request Navigator permission
  requestNavigatorPermission() {
    if (process.env.CLIENT) {
      window.Notification.requestPermission()
    }
  }

  //Push notification to navigator
  pushNavigator(params = {}) {
    return new Promise((resolve, reject) => {
      //Validate if is client side
      if (!process.env.CLIENT) return reject('No client side')
      //Push notification
      window.Notification.requestPermission(result => {
        if (result === 'granted') {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(params.title, {
              body: params.body,
              icon: params.icon,
              data: params.data || {}
            })
          }).catch(error => {
            console.error('[notification-plugin]::pushNavigator - ', error)
          })
        }
      })
    })
  }

  //Validate if navigator can share
  navigatorCanShare() {
    if (!process.env.CLIENT) return false
    return navigator.canShare ? true : false
  }

  //Share navigator
  navigatorShare(params = {}) {
    let text = (params.text || '')
    let url = (params.url || window.location.origin)

    //navigator share
    navigator.share({text: text, url: url}).then(function () {
    }, function (err) {
      alert.error('No fue posible compartir en este dispositivo :(');
    });
  }
}
