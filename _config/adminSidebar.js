const pages = config('pages') // Get Pages from config

export default [
  {
    title: 'notification.cms.sidebar.adminGroup',
    icon: 'fa-light fa-bell',
    children: [
      pages.qnotification.setting,
      //pages.qnotification.notification
    ]
  },
]
