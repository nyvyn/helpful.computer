"use client";

import type { ExcalidrawImperativeAPI, ExcalidrawProps, } from "@excalidraw/excalidraw/types";
import dynamic from "next/dynamic";
import { forwardRef, ForwardRefExoticComponent, RefAttributes } from "react";

import "@excalidraw/excalidraw/index.css";

const ExcalidrawLazy = dynamic(
    () => import("@excalidraw/excalidraw").then(m => m.Excalidraw),
    {ssr: false}
) as ForwardRefExoticComponent<
    ExcalidrawProps & RefAttributes<ExcalidrawImperativeAPI>
>;

/**
 * Loads the heavy Excalidraw component lazily and forwards its ref.
 */
const ExcalidrawWrapper = forwardRef<
    ExcalidrawImperativeAPI,
    ExcalidrawProps
>((props, ref) => <ExcalidrawLazy {...props} ref={ref}/>);

ExcalidrawWrapper.displayName = "ExcalidrawWrapper";
export default ExcalidrawWrapper;