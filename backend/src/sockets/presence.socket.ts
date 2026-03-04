const onlineUsers = new Map<string, number>();

export const userConnected = (userId: string) => {
    onlineUsers.set(userId, (onlineUsers.get(userId) ?? 0) + 1);
};

export const getOnlineUserIds = () => {
    return Array.from(onlineUsers.keys());
};

export const userDisconnected = (userId: string) => {
    const count = onlineUsers.get(userId);
    if (!count) return;

    if (count === 1) onlineUsers.delete(userId);
    else onlineUsers.set(userId, count - 1);
};

export const isUserOnline = (userId: string) => onlineUsers.has(userId);