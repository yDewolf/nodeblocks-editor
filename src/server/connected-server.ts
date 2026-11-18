import { SERVER_API_VERSION } from "~/network/api/api-version";
import { _setAppSession, appSession } from "./session";

const DEFAULT_SERVER_URL = "http://localhost:8080";
export class IncompatibleServerError extends Error {}

export async function getActiveServerUrl(): Promise<string> {
    return appSession.serverUrl || DEFAULT_SERVER_URL;
}

export async function setServerUrlAction(newUrl: string): Promise<boolean> {
    try {
        const response = await fetch(newUrl + "/api/health-check", {
            method: "POST",
            body: JSON.stringify({
                version: SERVER_API_VERSION
            })
        });
        if (!response.ok) {
            return false;
        }
        const data = await response.json();
        if (data.compatible) {
            _setAppSession("serverUrl", newUrl);
            return true;
        }
        console.error("Trying to connect to a incompatible server.", data.version);
        throw new IncompatibleServerError();
    
    } catch (err) {
        console.error("Failed to establish a connection with server", newUrl, err);
        return false;
    }
}
