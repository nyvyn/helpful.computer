import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

let api: ExcalidrawImperativeAPI | null = null;

export const setExcalidrawApi = (ref: ExcalidrawImperativeAPI | null) => {
  api = ref;
};

export const getExcalidrawApi = () => api;
