"use client";
import { useEffect, useRef } from "react";

export default function InteractiveCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (ctx) (globalThis as any).__aiCanvasCtx = ctx;

        const resize = () => {
            const {clientWidth, clientHeight} = canvas;
            if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
                canvas.width = clientWidth;
                canvas.height = clientHeight;
            }
            if (ctx) {
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        };

        resize();                                 // initial sizing
        const ro = new ResizeObserver(resize);    // keep in sync
        ro.observe(canvas);

        return () => {
            ro.disconnect();
            if ((globalThis as any).__aiCanvasCtx === ctx) delete (globalThis as any).__aiCanvasCtx;
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full border border-gray-700"
        />
    );
}
