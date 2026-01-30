import { useEffect, useRef } from "react";
import { useCall } from "../../../context/CallProvider";

const GlobalCallModal = () => {
  const {
    inCall,
    incomingCall,
    acceptCall,
    rejectCall,
    endCall,
    localStream,
    remoteStream,
  } = useCall();

  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localRef.current && localStream) {
      localRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteRef.current && remoteStream) {
      remoteRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Incoming call modal
  if (incomingCall && !inCall) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg space-y-4 text-center shadow-xl">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Incoming Video Call
          </p>
          <div className="flex gap-6 justify-center">
            {/* Accept */}
            <button
              onClick={acceptCall}
              className="w-14 h-14 flex items-center justify-center rounded-full 
                        bg-indigo-600 text-white hover:bg-indigo-500 transition"
              title="Accept Call"
            >
              <i className="fa-solid fa-phone"></i>
            </button>

            {/* Reject */}
            <button
              onClick={rejectCall}
              className="w-14 h-14 flex items-center justify-center rounded-full 
                        bg-red-600 text-white hover:bg-red-700 transition"
              title="Reject Call"
            >
              <i className="fa-solid fa-phone-slash"></i>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active call modal
  if (inCall) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex">
        <video
          ref={remoteRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        <video
          ref={localRef}
          autoPlay
          playsInline
          muted
          className="w-1/4 absolute bottom-4 right-4 rounded-lg shadow-lg border border-white/20"
        />

        {/* Control bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <button
            onClick={endCall}
            className="w-14 h-14 flex items-center justify-center rounded-full 
                      bg-red-600 text-white hover:bg-red-700 transition shadow-lg"
            title="End Call"
          >
            <i className="fa-solid fa-phone-slash text-lg"></i>
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default GlobalCallModal;
