export default {
  // Providers
  setting: {
    permission: 'notification.providers.manage',
    activated: true,
    path: '/notificaciones/configuracion',
    name: 'notification.admin.providers',
    layout: () => import('@imagina/qsite/_layouts/master'),
    page: () => import('@imagina/qnotification/_pages/admin/setting/index'),
    title: 'notification.cms.sidebar.adminProvider',
    icon: 'fa-light fa-bell-plus',
    authenticated: true,
    subHeader: {
      refresh: true,
    }
  }
}
