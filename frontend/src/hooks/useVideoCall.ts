import { useEffect, useRef, useState } from "react";
import { socket } from "../config/socket.config";

const ICE_SERVERS: RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const useVideoCall = (
    chatId: string | null,
    receiverId: string | null,
    incomingOffer: RTCSessionDescriptionInit | null
) => {
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
    const remoteStreamRef = useRef<MediaStream>(new MediaStream());

    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [inCall, setInCall] = useState(false);

    // cleanup function
    const cleanup = () => {
        // pcRef.current?.getSenders().forEach(s => s.track?.stop());
        pcRef.current?.close();
        pcRef.current = null;

        localStreamRef.current?.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;

        remoteStreamRef.current = new MediaStream();
        setRemoteStream(null);
        setInCall(false);
    };

    // create peer
    const createPeer = () => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        pc.onicecandidate = e => {
            if (e.candidate && receiverId) {
            socket.emit("call:ice-candidate", {
                receiverId,
                candidate: e.candidate,
            });
            }
        };

        pc.ontrack = e => {
            console.log("ONTRACK:", e.track.kind);

            remoteStreamRef.current.addTrack(e.track);
            setRemoteStream(remoteStreamRef.current);
        };

        pc.onconnectionstatechange = () => {
            console.log("PC state:", pc.connectionState);
        };

        pcRef.current = pc;
        return pc;
    };

    const getMedia = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });
        localStreamRef.current = stream;
        return stream;
    };

    // start call with web rtc
    const startCall = async () => {
        if (!receiverId) return;

        cleanup();

        const stream = await getMedia();
        const pc = createPeer();

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("call:offer", {
            receiverId,
            chatId,
            offer,
        });

        setInCall(true);
    };

    // accept call
    const acceptCall = async () => {
        if (!incomingOffer || !receiverId) return;

        if (pcRef.current) cleanup();

        const stream = await getMedia();
        const pc = createPeer();

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        await pc.setRemoteDescription(incomingOffer);

        pendingCandidatesRef.current.forEach(c =>
            pcRef.current?.addIceCandidate(c)
        );
        pendingCandidatesRef.current = [];

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("call:answer", {
            receiverId,
            answer,
        });

        setInCall(true);
    };

    // end call
    const endCall = () => {
        if (receiverId) {
            socket.emit("call:end", { receiverId });
        }
        cleanup();
    };

        // socket listeners
    useEffect(() => {
        const onAnswer = async ({ answer }: any) => {
            if(!pcRef.current) return;

            await pcRef.current?.setRemoteDescription(answer);

            pendingCandidatesRef.current.forEach(c => 
                pcRef.current?.addIceCandidate(c)
            );
            pendingCandidatesRef.current = [];
        };

        const onIce = ({ candidate }: any) => {
            if (!pcRef.current?.remoteDescription) {
                pendingCandidatesRef.current.push(candidate);
            } else {
                pcRef.current.addIceCandidate(candidate);
            }
        };

        const onEnd = cleanup;
        const onReject = cleanup;

        socket.on("call:answer", onAnswer);
        socket.on("call:ice-candidate", onIce);
        socket.on("call:end", onEnd);
        socket.on("call:reject", onReject);

        return () => {
            socket.off("call:answer", onAnswer);
            socket.off("call:ice-candidate", onIce);
            socket.off("call:end", onEnd);
            socket.off("call:reject", onReject);
        };
    }, [receiverId]);

    return {
        startCall,
        acceptCall,
        endCall,
        inCall,
        localStream: localStreamRef.current,
        remoteStream,
    };
};
