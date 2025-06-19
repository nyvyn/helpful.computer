"use client";

import { MicOffIcon } from "./icons/MicOffIcon.tsx";
import { MicOnIcon }  from "./icons/MicOnIcon.tsx";

interface Props {
  listening: boolean;
  toggleListening: () => void;
}

export default function ToggleListeningButton({ listening, toggleListening }: Props) {
  return (
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
      {listening ? <MicOnIcon className="size-6" /> : <MicOffIcon className="size-6" />}
      <span className="sr-only">
        {listening ? "Stop listening" : "Start listening"}
      </span>
    </button>
  );
}
