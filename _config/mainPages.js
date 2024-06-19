export default {
  notificationsIndex: {
    activated: true,
    path: '/notifications/me',
    name: 'notification.admin.notificationIndex',
    layout: () => import('layouts/master'),
    page: () => import('modules/qnotification/_pages/admin/notificationsIndex'),
    title: 'notification.cms.sidebar.adminGroup',
    icon: 'fa-light fa-panel-ews',
    authenticated: true,
    subHeader: {
      refresh: true,
    }
  }
}
