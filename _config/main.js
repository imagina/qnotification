import {eventBus, i18n, store} from "src/plugins/utils";

export default {
  moduleName: 'notification',
  //Entities
  entityNames: {
    rule: 'rule',
    notification: 'notification'
  },
  headerActions: async () => {
    return [
      //Notifications
      {
        order: 8,
        name: 'notifications',
        label: i18n.trp('isite.cms.label.notification'),
        badgeName: 'notification',
        props: {
          icon: 'fa-light fa-bell',
          class: 'btn-small'
        },
        action: () => eventBus.emit('toggleMasterDrawer', 'notification')
      }
    ]
  }
}
