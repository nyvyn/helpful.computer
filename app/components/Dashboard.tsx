"use client";

import AudioVisualizer   from "./visualizer/AudioVisualizer";
import AICanvas          from "./canvas/AICanvas";
import { MicOffIcon }    from "./icons/MicOffIcon.tsx";
import { MicOnIcon }     from "./icons/MicOnIcon.tsx";
import { useRealtime }   from "../hooks/useRealtime.ts";

export default function Dashboard() {
  const { listening, speaking, toggleListening } = useRealtime();

  return (
    <div className="flex min-h-screen min-w-screen bg-black">
      <div className="flex gap-4">
        <AudioVisualizer listening={listening} speaking={speaking}/>
        <AICanvas/>
      </div>

      {/* toggle-listening button */}
      <button
        onClick={toggleListening}
        className="
          absolute bottom-4 right-4
          flex items-center justify-center
          h-12 w-12 rounded-full
          bg-blue-600 disabled:bg-blue-400
          hover:bg-blue-700 text-white
          shadow-lg transition"
      >
        {listening ? <MicOnIcon className="size-6"/> : <MicOffIcon className="size-6"/>}
        <span className="sr-only">
          {listening ? "Stop listening" : "Start listening"}
        </span>
      </button>
    </div>
  );
}
