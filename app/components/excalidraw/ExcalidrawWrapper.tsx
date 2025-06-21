"use client";

import dynamic from "next/dynamic";
import { forwardRef, ForwardRefExoticComponent, RefAttributes } from "react";
import "@excalidraw/excalidraw/index.css";
import type {
    ExcalidrawImperativeAPI,
    ExcalidrawProps,
} from "@excalidraw/excalidraw/types";

const ExcalidrawLazy = dynamic(
    () => import("@excalidraw/excalidraw").then(m => m.Excalidraw),
    { ssr: false }
) as ForwardRefExoticComponent<
    ExcalidrawProps & RefAttributes<ExcalidrawImperativeAPI>
>;

const ExcalidrawWrapper = forwardRef<
    ExcalidrawImperativeAPI,
    ExcalidrawProps
>((props, ref) => <ExcalidrawLazy {...props} ref={ref} />);

ExcalidrawWrapper.displayName = "ExcalidrawWrapper";
export default ExcalidrawWrapper;