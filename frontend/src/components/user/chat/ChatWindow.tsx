// import ChatHeader from "./ChatHeader";
// import MessageList from "./MessageList";
// import MessageInput from "./MessageInput";
// import type { ChatListDTO } from "../../../types/chat/chat.dto";
// import { messageService } from "../../../services/message.service";
// import type { MessageDTO } from "../../../types/message/message.dto";
// import { useEffect, useRef, useState } from "react";
// import { notify } from "../../../utils/toastService";
// import { socket } from "../../../config/socket.config";
// import { useVideoCall } from "../../../hooks/useVideoCall";
// import { useCall } from "../../../context/CallProvider";

// interface ChatWindowProps {
//   selectedChat: ChatListDTO;
// }

// const ChatWindow: React.FC<ChatWindowProps> = ({ selectedChat }) => {
//   const [messages, setMessages] = useState<MessageDTO[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [isBlocked, setIsBlocked] = useState(false);
//   const [blockReason, setBlockReason] = useState<string | null>(null);

//   const localVideoRef = useRef<HTMLVideoElement | null>(null);
//   const remoteVideoRef = useRef<HTMLVideoElement | null>(null);


//     const {
//     startCall,
//     activeChatId,
//     localStream,
//     remoteStream,
//   } = useCall();

//   const isActiveCallChat = activeChatId === selectedChat.id;

//   useEffect(() => {
//     if (localVideoRef.current && localStream && isActiveCallChat) {
//       localVideoRef.current.srcObject = localStream;
//     }
//   }, [localStream, isActiveCallChat]);

//   useEffect(() => {
//     if (remoteVideoRef.current && remoteStream && isActiveCallChat) {
//       remoteVideoRef.current.srcObject = remoteStream;
//     }
//   }, [remoteStream, isActiveCallChat]);


//   useEffect(() => {

//     socket.emit("chat:join", selectedChat.id);

//     return () => {
//       socket.emit("chat:leave", selectedChat.id);
//     };
//   }, [selectedChat?.id]);
//   // to set chat is blocked 
//   useEffect(() => {
//     // if (!selectedChat) return;

//     setIsBlocked(selectedChat.isBlocked);
//     setBlockReason(selectedChat.blockReason ?? null);
//   }, [selectedChat?.id]);
//   // socket listen to check chat is blocked
//   useEffect(() => {
//     const handleBlockStatus = (data: {
//       isBlocked: boolean;
//       blockReason: string | null;
//     }) => {
//       setIsBlocked(data.isBlocked);
//       setBlockReason(data.blockReason);
//     };

//     socket.on("chat:block-status", handleBlockStatus);

//     return () => {
//       socket.off("chat:block-status", handleBlockStatus);
//     };
//   }, []);
//   // socket listen of incoming messages
//   useEffect(() => {
//     const handleIncomingMessage = (message: MessageDTO) => {
//       // avoid duplicate message for sender
//       setMessages((prev) => {
//         const exists = prev.some((m) => m.id === message.id);
//         return exists ? prev : [...prev, message];
//       });
//     };

//     socket.on("chat:message", handleIncomingMessage);

//     return () => {
//       socket.off("chat:message", handleIncomingMessage);
//     };
//   }, []);
//   // socket for delete message
//   useEffect(() => {
//     const handleDeleted = ({ messageId }: { messageId: string }) => {
//       setMessages(prev =>
//         prev.map(m =>
//           m.id === messageId
//             ? { ...m, isDeleted: true }
//             : m
//         )
//       );
//     };

//     socket.on("chat:message:deleted", handleDeleted);

//     return () => {
//       socket.off("chat:message:deleted", handleDeleted);
//     };
//   }, []);


//   useEffect(() => {
//     if (!selectedChat) return;

//     const fetchMessages = async () => {
//       try {
//         setLoading(true);
//         const response = await messageService.getChatMessages(selectedChat.id);

//         if (response.data.success) {
//           setMessages(response.data.messages);
//         }
//       } catch (error: any) {
//         notify.error(
//           error.response?.data?.error || "Failed to load chat messages"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMessages();
//   }, [selectedChat?.id]);

//   const handleSendMessage = async (data: {
//     type: "text" | "voice" | "file";
//     content?: string;
//     file?: File;
//     voice?: Blob;
//   }) => {
//     if (!selectedChat) return;

//     try {
//       const formData = new FormData();
//       formData.append("type", data.type);

//       if (data.type === "text") {
//         formData.append("content", data.content || "");
//       }

//       if (data.type === "file" && data.file) {
//         formData.append("file", data.file);
//       }

//       if (data.type === "voice" && data.voice) {
//         formData.append("file", data.voice, `voice-${Date.now()}.webm`);
//       }

//       await messageService.sendMessage(
//         selectedChat.id,
//         formData
//       );
//     } catch {
//       notify.error("Failed to send message");
//     }
//   };

//   return (
//     <div className="w-3/4 flex flex-col bg-gray-50 dark:bg-gray-800">
//       <ChatHeader
//         chat={selectedChat}
//         onStartCall={() => startCall(selectedChat.id)}
//         disabled={isBlocked}
//       />

//       {loading ? (
//         <div className="flex-1 flex items-center justify-center text-gray-500">
//           Loading messages...
//         </div>
//       ) : (
//         <MessageList messages={messages} />
//       )}

//       {/* only show input section if the chat is not blocked */}
//       {isBlocked ? (
//         <div className="px-4 py-5 border-t bg-yellow-50 dark:bg-gray-800 text-sm text-center text-yellow-700 dark:text-yellow-600">
//           {blockReason === "subscription_expired"
//             ? "Chat is blocked because direct messaging subscription has expired."
//             : "Chat is currently blocked."}
//         </div>
//       ) : (
//         <MessageInput onSend={handleSendMessage} />
//       )}

//      {/* {inCall && isActiveCallChat && (
//         <div className="fixed inset-0 bg-black z-50 flex">
//           <video
//             autoPlay
//             playsInline
//             ref={remoteVideoRef}
//             className="w-full"
//           />
//           <video
//             autoPlay
//             playsInline
//             ref={localVideoRef}
//             className="w-1/4 absolute bottom-4 right-4"
//           />
//           <button
//             onClick={endCall}
//             className="absolute bottom-6 left-1/2 bg-red-600 text-white px-6 py-2 rounded-full"
//           >
//             End Call
//           </button>
//         </div>
//       )} */}

//     </div>
//   );
// };

// export default ChatWindow;


import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import type { ChatListDTO } from "../../../types/chat/chat.dto";
import { messageService } from "../../../services/message.service";
import type { MessageDTO } from "../../../types/message/message.dto";
import { useEffect, useState } from "react";
import { notify } from "../../../utils/toastService";
import { socket } from "../../../config/socket.config";
import { useCall } from "../../../context/CallProvider";

interface ChatWindowProps {
  selectedChat: ChatListDTO;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedChat }) => {
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<string | null>(null);

  const { startCall } = useCall();

  // join / leave chat room
  useEffect(() => {
    socket.emit("chat:join", selectedChat.id);
    return () => {
      socket.emit("chat:leave", selectedChat.id);
    };
  }, [selectedChat.id]);

  // blocked state
  useEffect(() => {
    setIsBlocked(selectedChat.isBlocked);
    setBlockReason(selectedChat.blockReason ?? null);
  }, [selectedChat.id]);

  // block status updates
  useEffect(() => {
    const handleBlockStatus = (data: {
      isBlocked: boolean;
      blockReason: string | null;
    }) => {
      setIsBlocked(data.isBlocked);
      setBlockReason(data.blockReason);
    };

    socket.on("chat:block-status", handleBlockStatus);
    return () => {
      socket.off("chat:block-status", handleBlockStatus);
    };
  }, []);

  // incoming messages
  useEffect(() => {
    const handleIncomingMessage = (message: MessageDTO) => {
      setMessages(prev =>
        prev.some(m => m.id === message.id) ? prev : [...prev, message]
      );
    };

    socket.on("chat:message", handleIncomingMessage);
    return () => {
      socket.off("chat:message", handleIncomingMessage);
    };
  }, []);

  // deleted message
  useEffect(() => {
    const handleDeleted = ({ messageId }: { messageId: string }) => {
      setMessages(prev =>
        prev.map(m =>
          m.id === messageId ? { ...m, isDeleted: true } : m
        )
      );
    };

    socket.on("chat:message:deleted", handleDeleted);
    return () => {
      socket.off("chat:message:deleted", handleDeleted);
    };
  }, []);

  // fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await messageService.getChatMessages(selectedChat.id);
        if (res.data.success) {
          setMessages(res.data.messages);
        }
      } catch (err: any) {
        notify.error(err.response?.data?.error || "Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChat.id]);

  const handleSendMessage = async (data: {
    type: "text" | "voice" | "file";
    content?: string;
    file?: File;
    voice?: Blob;
  }) => {
    try {
      const formData = new FormData();
      formData.append("type", data.type);

      if (data.type === "text") formData.append("content", data.content || "");
      if (data.type === "file" && data.file) formData.append("file", data.file);
      if (data.type === "voice" && data.voice) {
        formData.append("file", data.voice, `voice-${Date.now()}.webm`);
      }

      await messageService.sendMessage(selectedChat.id, formData);
    } catch {
      notify.error("Failed to send message");
    }
  };

  return (
    <div className="w-3/4 flex flex-col bg-gray-50 dark:bg-gray-800">
      <ChatHeader
        chat={selectedChat}
        disabled={isBlocked}
        onStartCall={() =>
          startCall(
            selectedChat.id,
            selectedChat.otherUser.id // userId of receiver 
          )
        }
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Loading messages...
        </div>
      ) : (
        <MessageList messages={messages} />
      )}

      {isBlocked ? (
        <div className="px-4 py-5 border-t text-sm text-center text-yellow-700">
          {blockReason === "subscription_expired"
            ? "Chat is blocked because subscription expired."
            : "Chat is currently blocked."}
        </div>
      ) : (
        <MessageInput onSend={handleSendMessage} />
      )}
    </div>
  );
};

export default ChatWindow;
