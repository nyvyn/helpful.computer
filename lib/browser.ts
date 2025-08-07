"use client";

import { Webview, getCurrentWebview } from "@tauri-apps/api/webview";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalPosition, LogicalSize } from "@tauri-apps/api/dpi";

/**
 * Internal state for the secondary browser webview.
 */
let view: Webview | null = null;
let currentUrl: string | null = null;

/**
 * Ensure the webview exists and is positioned at the given bounds.
 */
export async function setBrowserBounds(bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
}) {
    if (view) {
        await view.setPosition(new LogicalPosition(bounds.x, bounds.y));
        await view.setSize(new LogicalSize(bounds.width, bounds.height));
    } else {
        const win = getCurrentWindow();
        view = new Webview(win, "browser", {
            url: currentUrl ?? "about:blank",
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
        });
    }
}

/** Navigate the browser webview to the provided URL. */
export async function navigateBrowser(url: string) {
    currentUrl = url;
    if (view) {
        const pos = await view.position();
        const size = await view.size();
        const win = view.window;
        await view.close();
        view = new Webview(win, "browser", {
            url,
            x: pos.x,
            y: pos.y,
            width: size.width,
            height: size.height,
        });
    }
}

/** Display arbitrary HTML content in the browser webview. */
export async function displayContent(html: string) {
    const dataUrl = `data:text/html,${encodeURIComponent(html)}`;
    await navigateBrowser(dataUrl);
}

/** Hide the browser webview. */
export async function hideBrowser() {
    await view?.hide();
}

/** Show the browser webview. */
export async function showBrowser() {
    await view?.show();
}

/** Get the URL currently displayed by the browser webview. */
export function getBrowserUrl() {
    return currentUrl;
}

/** Expose the underlying webview for debugging. */
export function getBrowserWebview() {
    return view ?? getCurrentWebview();
}

