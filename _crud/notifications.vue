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
          title: this.$tr('notification.cms.newNotification'),
          requestParams: {
            notToSnakeCase: ['saveInDatabase']
          }
        },
        read: {
          columns: [
            { name: 'id', label: this.$tr('isite.cms.form.id'), field: 'id', style: 'width: 50px' },
            { name: 'title', label: this.$tr('isite.cms.form.title'), field: 'title', align: 'rigth' },
            { name: 'recipient', label: this.$tr('isite.cms.label.recipient'), field: 'recipient', align: 'rigth' },
            { name: 'message', label: this.$tr('notification.cms.label.message'), field: 'message', align: 'rigth' },
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
          type: {
            value: 'email',
            type: 'select',
            required: true,
            props: {
              label: `${this.$tr('isite.cms.form.type')}*`,
              options: [
                {label: 'Email', value: 'email'},
              ],
            }
          },
          title: {
            value: '',
            type: 'input',
            required: true,
            props: {
              label: `${this.$tr('isite.cms.form.title')}*`
            }
          },
          email: {
            value: [],
            type: 'treeSelect',
            required: true,
            fakeFieldName: 'to',
            props: {
              label: `${this.$trp('isite.cms.label.recipient')}*`,
              multiple: true,
              rules: [
                val => !!val?.length || this.$tr('isite.cms.message.fieldRequired')
              ],
            },
            loadOptions: {
              apiRoute: 'apiRoutes.quser.users',
              select: {label: 'email', id: 'email'}
            }
          },
          message: {
            value: '',
            type: 'html',
            props: {
              label: `${this.$tr('notification.cms.label.message')} *`,
              rules: [
                val => !!val || this.$tr('isite.cms.message.fieldRequired')
              ],
            }
          },
          saveInDatabase: {
            fakeFieldName: 'setting',
            name: "saveInDatabase",
            value: '0',
            type: 'select',
            required: true,
            props: {
              label: 'Save in database',
              options: [
                { label: 'enabled', value: '1' },
                { label: 'disabled', value: '0' },
              ],
            },
          }
        }
      };
    }
  }
};
</script>
