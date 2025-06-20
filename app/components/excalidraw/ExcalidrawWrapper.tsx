"use client";

import dynamic from "next/dynamic";
import { forwardRef, ForwardRefExoticComponent, RefAttributes } from "react";
import "@excalidraw/excalidraw/index.css";

import type {
    ExcalidrawImperativeAPI,
    ExcalidrawProps,
} from "@excalidraw/excalidraw/types";

/* --- 1.  dynamic() + explicit ref typing -------------------------------- */
const Excalidraw = dynamic(
    () => import("@excalidraw/excalidraw").then((m) => m.Excalidraw),
    { ssr: false }
) as unknown as ForwardRefExoticComponent<
    ExcalidrawProps & RefAttributes<ExcalidrawImperativeAPI>
>;

/* --- 2.  Wrapper that actually exposes the ref -------------------------- */
const ExcalidrawWrapper = forwardRef<
    ExcalidrawImperativeAPI,
    ExcalidrawProps
>((props, ref) => <Excalidraw {...props} ref={ref} />);

ExcalidrawWrapper.displayName = "ExcalidrawWrapper";
export default ExcalidrawWrapper;