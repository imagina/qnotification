<template></template>

<script>
export default {
  data() {
    return {
      crudId: this.$uid()
    };
  },
  computed: {
    crudData() {
      return {
        crudId: this.crudId,
        entityName: config('main.qnotification.entityNames.notification'),
        apiRoute: 'apiRoutes.qnotification.notifications',
        permission: 'notification.notifications',
        create: {
          title: 'Nueva Notificación (PT)'
        },
        read: {
          columns: [
            { name: 'id', label: this.$tr('isite.cms.form.id'), field: 'id', style: 'width: 50px' },
            { name: 'title', label: this.$tr('isite.cms.form.title'), field: 'title', align: 'rigth' },
            { name: 'recipient', label: this.$tr('isite.cms.label.recipient'), field: 'recipient', align: 'rigth' },
            { name: 'message', label: 'Mesnaje (PT)', field: 'message', align: 'rigth' },
            {
              name: 'created_at', label: this.$tr('isite.cms.form.createdAt'), field: 'createdAt', align: 'right',
              format: val => val ? this.$trd(val) : '-'
            },
            {
              name: 'updated_at', label: this.$tr('isite.cms.form.updatedAt'), field: 'updatedAt', align: 'right',
              format: val => val ? this.$trd(val) : '-'
            },
            { name: 'actions', label: this.$tr('isite.cms.form.actions'), align: 'right' }
          ]
        },
        update: false,
        delete: true,
        formLeft: {
          id: { value: '' },
          title: {
            value: '',
            type: 'input',
            require: true,
            props: {
              label: `${this.$tr('isite.cms.form.title')}*`
            }
          },
          to: {
            value: '',
            type: 'input',
            require: true,
            props: {
              label: `${this.$tr('isite.cms.label.recipient')}*`
            }
          },
          type: {
            value: 'email',
            type: 'select',
            require: true,
            props: {
              label: `${this.$tr('isite.cms.form.type')}*`,
              options: [
                {label: this.$tr('isite.cms.label.email'), value: 'email'},
              ],
            }
          },
          message: {
            value: '',
            type: 'html',
            require: true,
            props: {
              label: `Mensaje(PT) *`
            }
          }
        }
      };
    }
  }
};
</script>
