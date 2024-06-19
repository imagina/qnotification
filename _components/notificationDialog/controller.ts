import { computed, reactive, toRefs } from 'vue';
import { helper, i18n } from 'src/plugins/utils';

export default function controller(props: any, emit: any) {
   // States
  const state = reactive( {
    dialog: false
  })

  const computeds = {
    imageUrl: computed(() =>{
      return props.notification?.mediaFiles?.mainimage?.id ? props.notification?.mediaFiles?.mainimage?.mediumThumb : false
    }),
    linkLabel: computed(() =>{
      return props.notification?.options?.linkLabel ? props.notification.options.linkLabel :  i18n.tr('notification.cms.openLink')
    })
  }


  // Methods
  const methods = {
      goToLink(){
        helper.openExternalURL(props.notification.link, true)//open expernal URL
      },
      closeModal(){
        state.dialog = false
        emit('update:modelValue', false);
      }
  }

  return {...(toRefs(state)), ...computeds, ...methods}
}
