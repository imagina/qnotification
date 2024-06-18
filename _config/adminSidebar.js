import pages from 'src/setup/pages';

export default [
  {
    title: 'notification.cms.sidebar.adminGroup',
    icon: 'fa-light fa-bell-on',
    children: [
      pages.qnotification.notification,
      pages.qnotification.setting
    ]
  }
];
