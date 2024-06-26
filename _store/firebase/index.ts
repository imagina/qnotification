import { reactive, computed } from 'vue';
import { getMessaging, onMessage, MessagePayload } from "firebase/messaging";
import baseService from 'modules/qcrud/_services/baseService.js';
import {
    checkPushNotifications,
    notificationFirebase,
    onBackgroundMessage,
    detectDevice,
} from 'modules/qnotification/_store/firebase/plugins/notificationUtils';
import {
    StateContract,
    StoreContract,
    NotificationContract
} from './contracts/firebase.contract';

/**
 * Broadcast channel for handling Firebase messaging events.
 * @type {BroadcastChannel}
 */
const eventChannel = new BroadcastChannel('firebase-messaging-channel');

/**
 * State object containing the reactive state properties.
 * @type {StateContract}
 */
const state = reactive<StateContract>({
    notification: {
        id: 0,
        message: '',
        icon: null,
        createdAt: null,
        isRead: null,
        link: null,
        isImportant: null
    },
    token: '',
    userId: 0,
    icon: '',
});

/**
 * Store object containing the computed properties and actions related to Firebase messaging.
 * @type {StoreContract}
 */
const store: StoreContract = computed(() => ({
    /**
     * Gets the notification list.
     * @type {NotificationContract}
     */
    get notification(): NotificationContract {
        return state.notification;
    },
    /**
     * Sets the notification list.
     * @type {NotificationContract[]}
     */
    set notification(value: NotificationContract) {
        state.notification = value;
    },
    /**
     * Gets the Firebase Cloud Messaging (FCM) token.
     * @type {string}
     */
    get token(): string {
        return state.token;
    },
    /**
     * Sets the Firebase Cloud Messaging (FCM) token.
     * @type {string}
     */
    set token(value: string) {
        state.token = value;
    },
    /**
     * Gets the user ID.
     * @type {number}
     */
    get userId(): number {
        return state.userId;
    },
    /**
     * Sets the user ID.
     * @type {number}
     */
    set userId(value: number) {
        state.userId = value;
    },
    /**
     * Gets the icon.
     * @type {string}
     */
    get icon(): string {
        return state.icon;
    },
    /**
     * Sets the icon.
     * @type {string}
     */
    set icon(value: string) {
        state.icon = value;
    },
    /**
     * Initializes Firebase Cloud Messaging (FCM) messaging.
     */
    getMessaging: (): void => {
        if (!checkPushNotifications.value) {
            console.log('Notifications are blocked.');
            return;
        }
        const messaging = getMessaging();
        onMessage(messaging, (payload: MessagePayload) => {
            notificationFirebase(payload);
        });
    },
    /**
     * Function to handle background messages.
     */
    onBackgroundMessage,
    /**
     * Removes the event listener for background messages.
     */
    removeEvent(): void {
        eventChannel.removeEventListener('message', onBackgroundMessage);
    },
    /**
     * Adds the event listener for background messages.
     */
    addEvent(): void {
        eventChannel.addEventListener('message', onBackgroundMessage);
    },
    /**
     * Sends the device information to the server.
     */
    sendDivice: (): void => {
        if(state.token.length === 0) return;
        const payload = {
            userId: state.userId,
            device: detectDevice(),
            token: state.token,
            provider: "firebase"
        }
        baseService.create('apiRoutes.qnotification.devices', payload);
    }
})).value;

export default store;
