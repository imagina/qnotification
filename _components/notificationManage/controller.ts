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
    lastItem(index: number) {
      const last = props.items.length - 1;
      return last === index;
    }
  };

  return { ...(toRefs(state)), ...methods };
}
