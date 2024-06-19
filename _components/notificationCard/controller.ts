import {computed, reactive, ref, onMounted, toRefs, watch, getCurrentInstance} from "vue";
import { i18n, helper } from 'src/plugins/utils';
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
    })
  }

  // Methods
  const methods = {
      markAsRead(){
        state.notification.isRead = true
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
          emit('read')
        })
      }
  }

  // Mounted
  onMounted(() => {
  })

  return {...refs, ...(toRefs(state)), ...computeds, ...methods}
}
