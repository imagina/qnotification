export default {
    notificationsIndex: {
        permission: 'notification.notifications.manage',
        activated: true,
        path: '/notifications/index',
        name: 'notification.admin.notificationIndex',
        //crud: import('@imagina/qnotification/_crud/notifications'),
        layout: () => import('@imagina/qsite/_layouts/master'),
        page: () => import('@imagina/qnotification/_pages/admin/notificationsIndex'),
        title: 'notification.cms.sidebar.adminGroup',
        icon: 'fa-light fa-panel-ews',
        authenticated: true,
        subHeader: {
          refresh: true,
        }
      }
}
