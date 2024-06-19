import {computed, reactive, onMounted, toRefs, watch} from "vue";
import apiResponse from 'src/modules/qcrud/_plugins/apiResponse'
import services from 'src/modules/qnotification/services'

export default function controller(props: any, emit: any) {
  // Refs
  const refs = {
    // refKey: ref(defaultValue)
  }

  // States
  const state = reactive( {
    loading: false,
    notification: props.itemNotification
  })

  // Computed
  const computeds = {
    isUnread: computed(() =>{
      return !state.notification.isRead
    }),
    iconName: computed(() => {
      return props.sourceSettings[props.itemNotification?.source] ? props.sourceSettings[props.itemNotification.source].icon : 'fa-light fa-bell';
    }),
    iconColor: computed(() => {
      return props.sourceSettings[props.itemNotification?.source] ? props.sourceSettings[props.itemNotification.source].color : '#2196f3';
    }),
  }

  // Methods
  const methods = {
      markAsRead(){
        state.notification.isRead = true
        emit('read')
        return new Promise((resolve, reject) => {
          services.markAsRead(state.notification.id).then(response => {
            resolve(state.notification)
          }).catch(error => {
            apiResponse.handleError(error, () => {
              state.notification.isRead = false
              state.loading = false
            })
          })
        })
      },
      openModal(){
        emit('openModal', state.notification)
        if(computeds.isUnread.value){
          methods.markAsRead()
        }
      },
      markAsReadHandler(){
        state.loading = true
        methods.markAsRead().then(() => {
          state.loading = false
        })
      }
  }

  // Mounted
  onMounted(() => {
  })

  watch(() => props.itemNotification, (newValue) => {
    state.notification = newValue;
  })

  return {...refs, ...(toRefs(state)), ...computeds, ...methods}
}
