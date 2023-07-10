import Vue, {reactive, computed} from 'vue';
import { getMessaging, onMessage, MessagePayload } from "firebase/messaging";
import moment from 'moment'

interface Notification {
    id: any;
    message: string;
    icon: any;
    createdAt: any;
    isRead: any;
    link: any;
    isImportant: any;
}

interface State {
    notificationList: Notification[]
}

const state = reactive<State>({
    notificationList: [],
});

const store  = computed(() => ({
    get notificationList() {
        return state.notificationList;
    },
    set notificationList(value) {
        state.notificationList = value;
    },
    getMessaging: () => {
        const messaging = getMessaging();
        onMessage(messaging, (payload: MessagePayload) => {
            const title = payload.notification!.title!;
            const notificationOptions: any = {
            body: payload.notification!.body,
            icon: '',
            };
            console.log(moment());
            const notification = {
                id: notificationOptions.id || Vue.prototype.$uid(),
                message: `<b>${title}</b> ${notificationOptions.body}`,
                icon: notificationOptions.icon || 'fas fa-bell',
                createdAt: notificationOptions.createdAt || moment(),
                isRead: notificationOptions.isRead || false,
                link: notificationOptions.link || false,
                isImportant: (notificationOptions.options && notificationOptions.options.isImportant) 
                ? notificationOptions.options.isImportant : false,
            }
            state.notificationList.unshift(notification);
            new Notification(title, notificationOptions);
        });
    }
})).value;

export default store;