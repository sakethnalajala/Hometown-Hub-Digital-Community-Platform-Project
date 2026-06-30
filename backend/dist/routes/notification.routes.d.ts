export declare const notificationRouter: import("express-serve-static-core").Router;
export declare function createNotification(data: {
    type: any;
    title: string;
    body: string;
    receiverId: string;
    senderId?: string;
    relatedId?: string;
    relatedType?: string;
    actionUrl?: string;
}): Promise<{
    id: string;
    createdAt: Date;
    type: string;
    body: string;
    title: string;
    isRead: boolean;
    actionUrl: string | null;
    imageUrl: string | null;
    relatedId: string | null;
    relatedType: string | null;
    receiverId: string;
    senderId: string | null;
}>;
//# sourceMappingURL=notification.routes.d.ts.map