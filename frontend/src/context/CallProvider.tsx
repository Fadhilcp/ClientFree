import { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../config/socket.config";
import { useVideoCall } from "../hooks/useVideoCall";

interface CallContextType {
  incomingCall: boolean;
  incomingChatId: string | null;
  activeChatId: string | null;
  inCall: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  startCall: (chatId: string, receiverId: string) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
}

interface CallOfferPayload {
  offer: RTCSessionDescriptionInit;
  chatId: string;
  from: string; // caller userId
}

const CallContext = createContext<CallContextType | null>(null);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [incomingOffer, setIncomingOffer] =
        useState<RTCSessionDescriptionInit | null>(null);

    const [incomingChatId, setIncomingChatId] = useState<string | null>(null);
    const [incomingCallerId, setIncomingCallerId] = useState<string | null>(null);

    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [activeReceiverId, setActiveReceiverId] = useState<string | null>(null);

    const {
        startCall,
        acceptCall,
        endCall,
        inCall,
        localStream,
        remoteStream,
    } = useVideoCall(activeChatId, activeReceiverId, incomingOffer);

    // socket events
    useEffect(() => {

        const onOffer = ({ offer, chatId, from }: CallOfferPayload) => {
            setIncomingOffer(offer);
            setIncomingChatId(chatId);
            setIncomingCallerId(from);

            setActiveChatId(chatId);
            setActiveReceiverId(from);
        };

        const reset = () => {
            setIncomingOffer(null);
            setIncomingChatId(null);
            setIncomingCallerId(null);
            setActiveChatId(null);
            setActiveReceiverId(null);
        };

        socket.on("call:offer", onOffer);
        socket.on("call:reject", reset);
        socket.on("call:end", reset);

        return () => {
            socket.off("call:offer", onOffer);
            socket.off("call:reject", reset);
            socket.off("call:end", reset);
        };
    }, []);

    useEffect(() => {
        if (activeChatId && activeReceiverId && !inCall && !incomingOffer) {
            startCall();
        }
    }, [activeChatId, activeReceiverId]);

    // outgoing call - both chatId and receiverId
    const startOutgoingCall = (chatId: string, receiverId: string) => {
        setActiveChatId(chatId);
        setActiveReceiverId(receiverId);
    };

    const acceptIncomingCall = () => {
        setIncomingOffer(null);
        setIncomingChatId(null);
        setIncomingCallerId(null);

        acceptCall();
    };

    const endActiveCall = () => {
        endCall();

        setIncomingOffer(null);
        setIncomingChatId(null);
        setIncomingCallerId(null);
        setActiveChatId(null);
        setActiveReceiverId(null);
    };

    // reject
    const rejectCall = () => {
        if (incomingCallerId) {
            socket.emit("call:reject", { receiverId: incomingCallerId });
        }
        setIncomingOffer(null);
        setIncomingChatId(null);
        setIncomingCallerId(null);
        setActiveChatId(null);
        setActiveReceiverId(null);
    };

    return (
        <CallContext.Provider
            value={{
                incomingCall: Boolean(incomingOffer),
                incomingChatId,
                activeChatId,
                inCall,
                localStream,
                remoteStream,
                startCall: startOutgoingCall,
                acceptCall: acceptIncomingCall,
                rejectCall,
                endCall: endActiveCall,
            }}
        >
            {children}
        </CallContext.Provider>
    );
};

export const useCall = () => useContext(CallContext)!;
