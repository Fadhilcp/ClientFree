import { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../config/socket.config";

type PresenceContextType = {
    onlineUsers: Set<string>;
    isOnline: (userId: string) => boolean;
};

const PresenceContext = createContext<PresenceContextType | null>(null);

export const PresenceProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    console.log("🚀 ~ PresenceProvider ~ onlineUsers:", onlineUsers)

    useEffect(() => {
        const onOnline = ({ userId }: { userId: string }) => {
            setOnlineUsers(prev => new Set(prev).add(userId));
        };

        const onOffline = ({ userId }: { userId: string }) => {
            setOnlineUsers(prev => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        };

        socket.on("user:online", onOnline);
        socket.on("user:offline", onOffline);

        return () => {
            socket.off("user:online", onOnline);
            socket.off("user:offline", onOffline);
        };
    }, []);

    return (
        <PresenceContext.Provider
            value={{
                onlineUsers,
                isOnline: (userId: string) => onlineUsers.has(userId),
            }}
        >
            {children}
        </PresenceContext.Provider>
    );
};

export const usePresence = () => {
  const ctx = useContext(PresenceContext);
  if (!ctx) {
    throw new Error("usePresence must be used inside PresenceProvider");
  }
  return ctx;
};