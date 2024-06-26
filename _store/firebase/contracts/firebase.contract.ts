import {
    MessagePayload
} from "firebase/messaging";

export interface NotificationContract {
    id: any;
    message: string;
    icon: any;
    createdAt: any;
    isRead: any;
    link: any;
    isImportant: any;
}

export interface StateContract {
    notification: NotificationContract;
    token: string;
    userId: number;
    icon: string;
}

export interface StoreContract {
    notification: NotificationContract;
    token: string;
    userId: number;
    icon: string;
    getMessaging: () => void;
    onBackgroundMessage: (event:  MessagePayload) => void;
    removeEvent(): void;
    addEvent(): void;
    sendDivice: () => void;
}