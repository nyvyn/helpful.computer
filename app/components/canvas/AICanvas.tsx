"use client";
import { useEffect, useRef } from "react";

export default function AICanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
            (globalThis as any).__aiCanvasCtx = ctx;
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
        return () => {
            if ((globalThis as any).__aiCanvasCtx === ctx) {
                delete (globalThis as any).__aiCanvasCtx;
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="border border-gray-700"
        />
    );
}
