import { Stronghold } from "@tauri-apps/plugin-stronghold";
import { appDataDir } from "@tauri-apps/api/path";

const VAULT_FILE = "vault.hold";
const VAULT_PASSWORD = "helpful-computer-vault";
const CLIENT_NAME = "helpful-computer";
const STORE_KEY = "openai_api_key";

async function initStore() {
    const path = `${await appDataDir()}/${VAULT_FILE}`;
    const stronghold = await Stronghold.load(path, VAULT_PASSWORD);
    let client;
    try {
        client = await stronghold.loadClient(CLIENT_NAME);
    } catch {
        client = await stronghold.createClient(CLIENT_NAME);
    }
    return { stronghold, store: client.getStore() };
}

export async function setOpenAiKey(key: string) {
    const { stronghold, store } = await initStore();
    const data = Array.from(new TextEncoder().encode(key));
    await store.insert(STORE_KEY, data);
    await stronghold.save();
}

export async function getOpenAiKey(): Promise<string | null> {
    try {
        const { store } = await initStore();
        const data = await store.get(STORE_KEY);
        if (data) {
            return new TextDecoder().decode(new Uint8Array(data));
        }
    } catch {
        // fall through to env var
    }

    const envKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? null;
    if (envKey) {
        await setOpenAiKey(envKey);
    }
    return envKey;
}
