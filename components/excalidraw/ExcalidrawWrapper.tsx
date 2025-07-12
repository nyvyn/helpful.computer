"use client";

import type { ExcalidrawImperativeAPI, ExcalidrawProps, } from "@excalidraw/excalidraw/types";
import dynamic from "next/dynamic";
import { forwardRef, ForwardRefExoticComponent, RefAttributes } from "react";

import "@excalidraw/excalidraw/index.css";

/**
 * Thin wrapper around the dynamically imported Excalidraw component.
 *
 * Forwarded refs give hooks access to the underlying API.
 */

const ExcalidrawLazy = dynamic(
    () => import("@excalidraw/excalidraw").then(m => m.Excalidraw),
    {ssr: false}
) as ForwardRefExoticComponent<
    ExcalidrawProps & RefAttributes<ExcalidrawImperativeAPI>
>;

const ExcalidrawWrapper = forwardRef<
    ExcalidrawImperativeAPI,
    ExcalidrawProps
>((props, ref) => <ExcalidrawLazy {...props} ref={ref}/>);

ExcalidrawWrapper.displayName = "ExcalidrawWrapper";
export default ExcalidrawWrapper;