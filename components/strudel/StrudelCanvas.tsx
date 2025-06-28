"use client";

import { StrudelContext, StrudelEditor } from "./StrudelContext.tsx";
import React, { useContext, useEffect, useRef } from "react";

export default function StrudelCanvas() {
  const ctx = useContext(StrudelContext);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let mounted = true;
    import("@strudel/repl").then(() => {
      if (!mounted) return;
      const el = document.createElement("strudel-editor") as StrudelEditor;
      containerRef.current?.appendChild(el);
      ctx?.setEditor(el);
    });

    return () => {
      mounted = false;
      ctx?.setEditor(null);
      containerRef.current?.firstChild?.remove();
    };
  }, [ctx]);

  return <div ref={containerRef} className="w-full h-full" />;
}
