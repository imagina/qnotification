import { computed, reactive, toRefs, onMounted, onBeforeUnmount } from 'vue';
import { eventBus, helper, i18n } from 'src/plugins/utils';

export default function controller(_: any, emit: any) {
   // States
  const state = reactive( {
    dialog: false,
    notification: null
  })

  const computeds = {
    imageUrl: computed(() =>{
      return state.notification?.mediaFiles?.mainimage?.id ? state.notification.mediaFiles.mainimage.mediumThumb : false
    }),
    linkLabel: computed(() =>{
      return state.notification?.options?.linkLabel ? state.notification.options.linkLabel :  i18n.tr('notification.cms.openLink')
    }),
    sourceData: computed(() => {
      return {
        backgroundColor: "#D9D9D9",
        color: "#2196f3",
        icon: "fa-light fa-home",
        ...(state.notification?.sourceData || {})
      };
    })
  }


  // Methods
  const methods = {
    init() {
      eventBus.on('imagina.notification.open', (response) => {
        state.notification = response
        state.dialog = true;
      });
    },
    goToLink(){
      helper.openExternalURL(state.notification?.url || state.notification.link, true)//open expernal URL
    },
    closeModal(){
      state.dialog = false
      emit('update:modelValue', false);
    }
  }

  onMounted(() => {
    methods.init()
  })

  onBeforeUnmount(() => {
    eventBus.off('imagina.notification.open')
  })

  return {...(toRefs(state)), ...computeds, ...methods}
}
