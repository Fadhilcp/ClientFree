import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

interface VoiceNoteBubbleProps {
  audioUrl: string;
  isOwnMessage: boolean;
  createdAt: string;
}

const VoiceNoteBubble: React.FC<VoiceNoteBubbleProps> = ({
  audioUrl,
  isOwnMessage,
  createdAt,
}) => {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const waveSurfer = useRef<WaveSurfer | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!waveformRef.current) return;

    waveSurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: isOwnMessage ? "#C7D2FE" : "#6B7280",
      progressColor: isOwnMessage ? "#FFFFFF" : "#111827",
      cursorColor: "transparent",
      barWidth: 3,
      barGap: 2,
      height: 30,
      normalize: true,
    });

    waveSurfer.current.load(audioUrl);

    waveSurfer.current.on("finish", () => setPlaying(false));

    return () => {
      waveSurfer.current?.destroy();
    };
  }, [audioUrl, isOwnMessage]);

  const togglePlay = () => {
    if (!waveSurfer.current) return;
    waveSurfer.current.playPause();
    setPlaying((p) => !p);
  };

return (
    <div
      className={`max-w-[480px] md:max-w-[300px] w-full p-4 rounded-lg shadow-md
        ${
          isOwnMessage
            ? "bg-indigo-900 text-white rounded-br-none"
            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
        }`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="px-3 h-9   rounded-full bg-white/20 hover:bg-white/30 transition"
        >
          {playing ? (
            <i className="fa-solid fa-pause" />
          ) : (
            <i className="fa-solid fa-play" />
          )}
        </button>

        {/* REAL waveform */}
        <div ref={waveformRef} className="flex-1" />
      </div>

      <span className="text-xs opacity-70 mt-1 block text-right">
        {new Date(createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
);
};

export default VoiceNoteBubble;
