<template></template>

<script>
export default {
  data() {
    return {
      crudId: this.$uid(),
      users: []
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
            { name: 'type', label: this.$tr('isite.cms.label.provider'), field: 'type', align: 'rigth' },
            {
              name: 'user', label: this.$tr('isite.cms.label.user'), field: 'user', align: 'rigth',
              format: val => val?.fullName || '-'
            },
            {
              name: 'recipient', label: this.$tr('isite.cms.label.recipient'), field: 'recipientUser', align: 'rigth',
              format: (val, row) => row.recipientUser?.email || row.recipient
            },
            {
              name: 'title', label: this.$tr('isite.cms.form.title'), field: 'title', align: 'rigth',
              classes: 'ellipsis', style: 'max-width : 250px'
            },
            {
              name: 'message', label: this.$tr('notification.cms.label.message'), field: 'message', align: 'rigth',
              classes: 'ellipsis', style: 'max-width : 250px'
            },
            {
              name: 'created_at', label: this.$tr('isite.cms.form.createdAt'), field: 'createdAt', align: 'right',
              format: val => val ? this.$trd(val) : '-'
            },
            {
              name: 'updated_at', label: this.$tr('isite.cms.form.updatedAt'), field: 'updatedAt', align: 'right',
              format: val => val ? this.$trd(val) : '-'
            }
          ],
          requestParams: { include: 'user,recipientUser' }
        },
        update: false,
        delete: false,
        formLeft: {
          id: { value: '' },
          providers: {
            value: [],
            type: 'select',
            required: true,
            props: {
              label: `${this.$trp('isite.cms.label.provider')}*`,
              multiple: true,
              useChips: true,
              options: [
                { label: 'Email', value: 'email' },
                {
                  label: 'Broadcast',
                  value: 'broadcast',
                  sublabel: this.$tr('notification.cms.helpTextBroadcastOption')
                },
                {
                  label: this.$tr('notification.cms.isImportant'),
                  value: 'broadcastImportant',
                  sublabel: this.$tr('notification.cms.isImportantHelpText')
                },
              ],
            }
          },
          users: {
            value: [],
            type: 'select',
            props: {
              label: `${this.$trp('isite.cms.label.recipient')}*`,
              multiple: true,
              useChips: true,
              useInput: true,
              rules: [
                val => !!val?.length || this.$tr('isite.cms.message.fieldRequired')
              ],
            },
            loadOptions: {
              apiRoute: 'apiRoutes.quser.users',
              filterByQuery: true,
              select: {
                label: 'email',
                id: item => `${item.id}::${item.email}`,
                sublabel: 'fullName'
              }
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
          message: {
            value: '',
            type: 'html',
            props: {
              label: `${this.$tr('notification.cms.label.message')} *`,
              rules: [
                val => !!val || this.$tr('isite.cms.message.fieldRequired')
              ],
            }
          }
        },
        formRight: {
          link: {
            value: null,
            type: 'input',
            props: {
              label: `URL`
            }
          },
          mediasSingle: {
            name: 'mediasSingle',
            value: {},
            type: 'media',
            props: {
              label: this.$tr('isite.cms.form.image'),
              zone: 'mainimage',
              entity: "Modules\\Notification\\Entities\\Notification",
              entityId: null
            }
          }
        },
        getDataForm: (data, typeForm) => {
          return new Promise((resolve, reject) => {
            //Init the formData
            let formData = {
              userId: this.$store.state.quserAuth.userId,
              source: config('app.mode'),
              setting: { saveInDatabase: '1' },
              title: data.title,
              message: data.message,
              mediasSingle: data.mediasSingle,
              link: data.link,
              to: {},
              options: {}
            }

            //Set the recipients by provider
            let providerUserToNotify = {
              broadcast: data.users.map(item => item.split('::')[0]),
              email: data.users.map(item => item.split('::')[1])
            }
            data.providers.forEach(provider => {
              if (provider == 'broadcastImportant') {
                provider = 'broadcast'
                formData.options.isImportant = true
              }
              formData.to[provider] = providerUserToNotify[provider]
            })

            resolve(formData)
          })
        },
      };
    }
  }
};
</script>
