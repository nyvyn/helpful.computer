"use client";

import dynamic from "next/dynamic";
import { forwardRef } from "react";
import "@excalidraw/excalidraw/index.css";

import type {
    ExcalidrawImperativeAPI,
    ExcalidrawProps,
} from "@excalidraw/excalidraw/types";

/* dynamic wrapper that forwards the ref to the real Excalidraw component */
const ExcalidrawWrapper = dynamic(
    () =>
        import("@excalidraw/excalidraw").then((mod) =>
            forwardRef<ExcalidrawImperativeAPI, ExcalidrawProps>(
                (props, ref) => <mod.Excalidraw {...props} ref={ref} />,
            ),
        ),
    { ssr: false },
);

/* eslint fix: give the component an explicit display name */
(ExcalidrawWrapper as React.ComponentType).displayName = "ExcalidrawWrapper";

export default ExcalidrawWrapper;
