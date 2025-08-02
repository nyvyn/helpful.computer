"use client";

import { appDataDir } from "@tauri-apps/api/path";
import { Stronghold } from "@tauri-apps/plugin-stronghold";

const CLIENT_NAME = "helpful-computer";
const STORE_KEY = "openai_api_key";
const VAULT_FILE = "vault.hold";
const VAULT_PASSWORD = "helpful-computer-vault";

const initStore = async () => {
    const path = `${await appDataDir()}/${VAULT_FILE}`;
    const stronghold = await Stronghold.load(path, VAULT_PASSWORD);

    let client;
    try {
        client = await stronghold.loadClient(CLIENT_NAME);
    } catch {
        client = await stronghold.createClient(CLIENT_NAME);
    }

    return {
        client,
        stronghold
    };
};

export async function setOpenaiKey(key: string) {
    const {client, stronghold} = await initStore();
    const data = Array.from(new TextEncoder().encode(key));
    const store = client.getStore();
    await store.insert(STORE_KEY, data);
    await stronghold.save();
}

export async function getOpenaiKey(): Promise<string | null> {
    const {client} = await initStore();
    const store = client.getStore();
    const data = await store.get(STORE_KEY);
    return data ? new TextDecoder().decode(new Uint8Array(data)) : null;
}
