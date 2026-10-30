"use server";
import { useSession } from "@solidjs/start/http";
import { UserSessionData } from "~/network/protocols/user-session";

const SERVER_URL = process.env.SERVER_URL ?? "http://localhost:8080"

export async function useAppSession() {
    if (!process.env.SESSION_SECRET) {
        console.error("Missing .env SESSION_SECRET");
    }
    return useSession({
        name: "nodeblocks-app-session",
        password: process.env.SESSION_SECRET,
    });
}

export async function getUserSession(): Promise<UserSessionData | null> {
    const session = await useAppSession();
    return (session.data as UserSessionData) || null;
}

export async function loginAction(user_id: string, password?: string): Promise<UserSessionData> {
    const response = await fetch(`${SERVER_URL}/api/user/login`, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ user_id, password })
    });

    if (!response.ok) {
        throw new Error(`Failed to log as ${user_id}`);
    }

    const json_data = await response.json();
    
    const session = await useAppSession();
    await session.update({
        user_id: json_data.user_id,
        display_name: json_data.display_name
    });

    return session.data as UserSessionData;
}

export async function logoutAction(): Promise<void> {
    const session = await useAppSession();
    await session.clear();
}
