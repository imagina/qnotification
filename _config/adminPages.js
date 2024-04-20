export default {
  // Providers
  setting: {
    permission: 'notification.providers.manage',
    activated: true,
    path: '/notificaciones/configuracion',
    name: 'notification.admin.providers',
    layout: () => import('layouts/master'),
    page: () => import('modules/qnotification/_pages/admin/setting/index'),
    title: 'notification.cms.sidebar.adminProvider',
    icon: 'fa-light fa-bell-plus',
    authenticated: true,
    subHeader: {
      refresh: true,
    }
  },
  notification: {
    permission: 'notification.notifications.manage',
    activated: true,
    path: '/notificaciones/panel',
    name: 'notification.admin.notification',
    crud: import('modules/qnotification/_crud/notifications'),
    layout: () => import('layouts/master'),
    page: () => import('modules/qcrud/_pages/admin/crudPage'),
    title: 'Panel (PT)',
    icon: 'fa-light fa-panel-ews',
    authenticated: true,
    subHeader: {
      refresh: true,
    }
  }
}
