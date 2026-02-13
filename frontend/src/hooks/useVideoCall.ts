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
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);

    const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [inCall, setInCall] = useState(false);

    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);


    const cleanup = () => {
        pcRef.current?.getSenders().forEach(s => s.track?.stop());
        pcRef.current?.close();
        pcRef.current = null;

        localStreamRef.current?.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
        setLocalStream(null);

        setRemoteStream(null);
        setInCall(false);
    };

    const createPeer = (receiverId: string) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        pc.onicecandidate = e => {
            if (e.candidate) {
                socket.emit("call:ice-candidate", {
                    receiverId,
                    candidate: e.candidate,
                });
            }
        };

        pc.ontrack = e => {
            const [stream] = e.streams;
            if (stream) setRemoteStream(stream);
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
        setLocalStream(stream);
        return stream;
    };

    const startCall = async (chatId: string, receiverId: string) => {
        cleanup();

        const stream = await getMedia();
        const pc = createPeer(receiverId);

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

    const acceptCall = async () => {
        if (!incomingOffer || !receiverId) return;

        cleanup();

        const stream = await getMedia();
        const pc = createPeer(receiverId);

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        await pc.setRemoteDescription(incomingOffer);

        pendingCandidatesRef.current.forEach(c =>
            pc.addIceCandidate(c)
        );
        pendingCandidatesRef.current = [];

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("call:answer", { receiverId, chatId, answer });
        setInCall(true);
    };

    const toggleMic = () => {
        if (!localStreamRef.current) return;

        localStreamRef.current.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled;
            setIsMicOn(track.enabled);
        });
    };

    const toggleCamera = () => {
        if (!localStreamRef.current) return;

        localStreamRef.current.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
            setIsCameraOn(track.enabled);
        });
    };


    useEffect(() => {
        const onAnswer = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
            if (!pcRef.current) return;

            await pcRef.current.setRemoteDescription(answer);

            pendingCandidatesRef.current.forEach(c =>
                pcRef.current?.addIceCandidate(c)
            );
            pendingCandidatesRef.current = [];
        };

        const onIceCandidate = ({ candidate }: { candidate: RTCIceCandidateInit }) => {
            if (!pcRef.current) {
                pendingCandidatesRef.current.push(candidate);
                return;
            }

            if (!pcRef.current.remoteDescription) {
                pendingCandidatesRef.current.push(candidate);
                return;
            }

            pcRef.current.addIceCandidate(candidate);
        };

        socket.on("call:answer", onAnswer);
        socket.on("call:ice-candidate", onIceCandidate);

        return () => {
            socket.off("call:answer", onAnswer);
            socket.off("call:ice-candidate", onIceCandidate);
        };
    }, []);

    return {
        startCall,
        acceptCall,
        endCall: cleanup,
        inCall,
        localStream,
        remoteStream,
        isMicOn,
        isCameraOn,
        toggleMic,
        toggleCamera,
    };
};
