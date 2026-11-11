"use server";
import { UserSessionData } from "~/network/protocols/user-session";
import { useAppSession } from "./session";

export interface AppSessionData extends UserSessionData {
    server_url?: string;
}

const DEFAULT_SERVER_URL = ((process.env.SERVER_HOST ?? "http://localhost") + ":" + (process.env.SERVER_PORT ?? "8080"))

export async function getActiveServerUrl(): Promise<string> {
    const session = await useAppSession();
    const data = session.data as AppSessionData;
    return data?.server_url || DEFAULT_SERVER_URL;
}

export async function setServerUrlAction(newUrl: string): Promise<boolean> {
    try {
        await fetch(newUrl);
    } catch {
        console.error("Failed to establish a connection with server", newUrl);
        return false;
    }
    const session = await useAppSession();
    await session.update({
        ...session.data,
        server_url: newUrl,
    });
    return true;
}
