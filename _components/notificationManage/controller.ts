import { reactive, toRefs } from 'vue';

export default function controller(props: any, emit: any) {

  // States
  const state = reactive({
    dialog: false,
    notification: null
  });

  // Methods
  const methods = {
    openModal(item = null) {
      state.notification = item;
      state.dialog = true;
    },
    getIcon(item: any) {
      return props.sourceSettings[item?.source] ? props.sourceSettings[item.source].icon : 'fa-light fa-bell';
    },
    getIconColor(item: any) {
      return props.sourceSettings[item?.source] ? props.sourceSettings[item.source].color : '#2196f3';
    },
    lastItem(index: number) {
      const last = props.items.length - 1;
      return last === index;
    }
  };

  return { ...(toRefs(state)), ...methods };
}
