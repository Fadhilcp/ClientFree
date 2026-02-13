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
    isMicOn: boolean;
    isCameraOn: boolean;
    toggleMic: () => void;
    toggleCamera: () => void;
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
        isMicOn,
        isCameraOn,
        toggleMic,
        toggleCamera,
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
        const onRemoteEnd = () => {
            endCall();        // WebRTC cleanup
            resetCallState(); // UI cleanup
        };

        socket.on("call:offer", onOffer);
        socket.on("call:end", onRemoteEnd);
        socket.on("call:reject", onRemoteEnd);

        return () => {
            socket.off("call:offer", onOffer);
            socket.off("call:end", onRemoteEnd);
            socket.off("call:reject", onRemoteEnd);
        };
    }, []);

    useEffect(() => {
        const onRemoteEnd = () => {
            resetCallState();
        };

        socket.on("call:end", onRemoteEnd);
        socket.on("call:reject", onRemoteEnd);

        return () => {
            socket.off("call:end", onRemoteEnd);
            socket.off("call:reject", onRemoteEnd);
        };
    }, []);

    // outgoing call - both chatId and receiverId
    const startOutgoingCall = (chatId: string, receiverId: string) => {
        setActiveChatId(chatId);
        setActiveReceiverId(receiverId);

        startCall(chatId, receiverId);
    };

    const resetCallState = () => {
        setIncomingOffer(null);
        setIncomingChatId(null);
        setIncomingCallerId(null);
        setActiveChatId(null);
        setActiveReceiverId(null);
    };

    const acceptIncomingCall = () => {
        setIncomingOffer(null);
        setIncomingChatId(null);
        setIncomingCallerId(null);

        acceptCall();
    };

    const endActiveCall = () => {
        if (activeReceiverId) {
            socket.emit("call:end", { receiverId: activeReceiverId });
        }

        endCall();
        resetCallState();
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
                isMicOn,
                isCameraOn,
                toggleMic,
                toggleCamera,
            }}
        >
            {children}
        </CallContext.Provider>
    );
};

export const useCall = () => useContext(CallContext)!;
