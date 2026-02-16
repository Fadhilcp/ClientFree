import { useRef, useState } from "react";
import { socket } from "../../../config/socket.config";

interface MessageInputProps {
  chatId: string;
  onSend: (data: {
    type: "text" | "voice" | "file";
    content?: string;
    file?: File;
    voice?: Blob;
  }) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ chatId, onSend }) => {
  const [message, setMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const discardedRef = useRef(false);
  const typingTimeout = useRef<number | null>(null);

  // send text
  const handleSendText = () => {
    if (!message.trim()) return;

    onSend({ type: "text", content: message });

    socket.emit("chat:typing:stop", { chatId });

    setMessage("");
  };

  // send file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onSend({ type: "file", file });
    e.target.value = "";
  };

  // start/stop recording
  const toggleRecording = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];
    discardedRef.current = false; // reset discard flag

    mediaRecorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      if (!discardedRef.current && audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        onSend({ type: "voice", voice: audioBlob });
      }
      stream.getTracks().forEach((t) => t.stop());
      setRecordingTime(0);
    };

    mediaRecorder.start();
    setRecording(true);

    // start timer
    setRecordingTime(0);
    timerRef.current = window.setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  // discard recording
  const discardRecording = () => {
    discardedRef.current = true; // mark as discarded
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
    }
    audioChunksRef.current = [];
    setRecording(false);
    setRecordingTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };
  // typing indicators
  const handleTypingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    // start typing
    socket.emit("chat:typing:start", { chatId });

    // debounce stop typing
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = window.setTimeout(() => {
      socket.emit("chat:typing:stop", { chatId });
    }, 800);
  };
  
  // format mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center gap-3 border-t border-gray-200 dark:border-gray-700">
      {/* Attach */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 rounded-full text-gray-500 dark:text-gray-400 
                   hover:bg-gray-100 dark:hover:bg-gray-700 
                   hover:text-indigo-600 dark:hover:text-indigo-400 
                   transition"
        title="Attach file"
      >
        <i className="fa-solid fa-paperclip"></i>
      </button>
      <input ref={fileInputRef} type="file" hidden onChange={handleFileChange} />

      {/* Input or Recording */}
      {recording ? (
        <div className="flex-1 flex items-center justify-between rounded-full px-4 text-sm 
                        bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 
                        border border-red-300 dark:border-red-600">
          <span>Recording... {formatTime(recordingTime)}</span>
          <button
            onClick={discardRecording}
            className="ml-2 py-2 rounded-full text-white transition"
            title="Discard recording"
          >
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      ) : (
        <input
          value={message}
          onChange={handleTypingChange}
          onKeyDown={(e) => e.key === "Enter" && handleSendText()}
          className="flex-1 rounded-full px-4 py-2 text-sm 
                     bg-gray-100 dark:bg-gray-700 
                     text-gray-900 dark:text-gray-100 
                     border border-gray-300 dark:border-gray-600 
                     focus:outline-none focus:ring-1 focus:ring-indigo-500 
                     transition"
          type="text"
          placeholder="Type a message..."
        />
      )}

      {/* Conditional Buttons */}
      {message.trim() ? (
        <button
          onClick={handleSendText}
          className="py-2 px-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition"
          title="Send message"
        >
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      ) : (
        <button
          onClick={toggleRecording}
          className={`py-2 px-3 rounded-full ${
            recording ? "bg-red-800 hover:bg-red-700" : "bg-gray-500 hover:bg-gray-600"
          } text-white transition`}
          title="Voice message"
        >
          <i className="fa-solid fa-microphone"></i>
        </button>
      )}
    </div>
  );
};

export default MessageInput;