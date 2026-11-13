import { UserSessionData } from "~/network/protocols/user-session";
import { getActiveServerUrl } from "./connected-server";
import { _setAppSession } from "./session";

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
    
    const userSession = json_data as UserSessionData;
    _setAppSession("userSession", userSession);

    return userSession;
}

export async function logoutAction(): Promise<void> {
    _setAppSession("userSession", undefined);
}
