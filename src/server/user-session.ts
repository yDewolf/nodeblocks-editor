"use server";

import { UserSessionData } from "~/network/protocols/user-session";
import { getActiveServerUrl } from "./connected-server";
import { useAppSession } from "./session";

export async function loginAction(user_id: string, password?: string): Promise<UserSessionData> {
    const serverUrl = await getActiveServerUrl();
    const response = await fetch(`${serverUrl}/api/user/login`, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ user_id, password })
    });

    if (!response.ok) {
        throw new Error(`Failed to log as ${user_id} on ${serverUrl}`);
    }

    const json_data = await response.json();
    
    const session = await useAppSession();
    await session.update({
        ...session.data,
        user_id: json_data.user_id,
        display_name: json_data.display_name
    });

    return session.data as UserSessionData;
}

export async function logoutAction(): Promise<void> {
    const session = await useAppSession();
    await session.update({
        ...session.data,
        user_id: undefined,
        display_name: undefined
    })
}
