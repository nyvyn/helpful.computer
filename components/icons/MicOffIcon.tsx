import { SVGProps } from "react";

export function MicOffIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* microphone body */}
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
      <path d="M15 15.1V9a3 3 0 0 0-5-2.83" />
      {/* slash */}
      <line x1="2" y1="2" x2="22" y2="22" />
      {/* base */}
      <path d="M12 19v3" />
      <path d="M8 22h8" />
    </svg>
  );
}
