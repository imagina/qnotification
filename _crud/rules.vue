<template></template>

<script>
  export default {
    data() {
      return {
        crudId: this.$uid()
      }
    },
    computed: {
      crudData() {
        return {
          crudId: this.crudId,
          entityName: config("main.qnotification.entityNames.rule"),
          apiRoute: 'apiRoutes.qnotification.rules',
          permission: null,
          create: {
            title: this.$tr('setup.layout.newPaymentMethod'),
            emitEvent: true
          },
          read: {
            columns: [
              {name: 'id', label: this.$tr('isite.cms.form.id'), field: 'id', style: 'width: 50px'},
              {name: 'name', label: this.$tr('isite.cms.form.name'), field: 'name', align: 'rigth'},
              {
                name: 'created_at', label: this.$tr('isite.cms.form.createdAt'), field: 'createdAt', align: 'right',
                format: val => val ? this.$trd(val) : '-',
              },
              {
                name: 'updated_at', label: this.$tr('isite.cms.form.updatedAt'), field: 'updatedAt', align: 'right',
                format: val => val ? this.$trd(val) : '-',
              },
              {name: 'actions', label: this.$tr('isite.cms.form.actions'), align: 'right'},
            ],
          },
          update: {emitEvent: true},
          delete: true,
        }
      }
    }
  }
</script>
