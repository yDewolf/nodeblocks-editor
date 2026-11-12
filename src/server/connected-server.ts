import { _setAppSession, appSession } from "./session";

const DEFAULT_SERVER_URL = "http://localhost:8080";

export async function getActiveServerUrl(): Promise<string> {
    return appSession.serverUrl || DEFAULT_SERVER_URL;
}

export async function setServerUrlAction(newUrl: string): Promise<boolean> {
    try {
        // TODO: implement health check stuff on server
        const response = await fetch(newUrl + "/api/health-check");
    } catch {
        console.error("Failed to establish a connection with server", newUrl);
        return false;
    }
    _setAppSession("serverUrl", newUrl);
    return true;
}
