import Vue, { reactive, computed } from 'vue';
import { getMessaging, onMessage, MessagePayload } from "firebase/messaging";
import baseService from '@imagina/qcrud/_services/baseService.js';
import moment from 'moment';

const eventChannel = new BroadcastChannel('firebase-messaging-channel');
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
    notificationList: Notification[];
    token: String | null;
    userId: number | null;
}

const state = reactive<State>({
    notificationList: [],
    token: null,
    userId: null,
});

function notificationFirebase(payload) {
    const title = payload.notification!.title!;
    const notificationOptions: any = {
        body: payload.notification!.body,
        icon: '',
    };
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
}
function onBackgroundMessage(event) {
    const payload = event.data;
    notificationFirebase(payload);
}

const store = computed(() => ({
    get notificationList() {
        return state.notificationList;
    },
    set notificationList(value) {
        state.notificationList = value;
    },
    get token() {
        return state.token;
    },
    set token(value) {
        state.token = value;
    },
    get userId() {
        return state.userId;
    },
    set userId(value) {
        state.userId = value;
    },
    getMessaging: () => {
        const messaging = getMessaging();
        onMessage(messaging, (payload: MessagePayload) => {
            notificationFirebase(payload);
        });
    },
    onBackgroundMessage,
    removeEvent() {
        eventChannel.removeEventListener('message', onBackgroundMessage);
    },
    addEvent() {
        eventChannel.addEventListener('message', onBackgroundMessage);
    },
    sendDivice: () => {
        const payload = {
            userId: state.userId,
            device: navigator.platform,
            token: state.token,
            provider: "firebase"
        }
        baseService.create('apiRoutes.qnotification.devices', payload)
    }
})).value;

export default store;