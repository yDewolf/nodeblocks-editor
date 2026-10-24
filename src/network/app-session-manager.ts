import { UserSessionData } from './protocols/user-session';

export class AppSessionManager {
    public sessionData?: UserSessionData

    // Server urls
    public readonly baseHttpUrl: string;
    public readonly baseWsUrl: string;

    constructor(host: string = "localhost", port: number = 8080) {
        this.baseHttpUrl = `http://${host}:${port}`;
        this.baseWsUrl = `ws://${host}:${port}`;
    }

    public async login(user_id: string, password?: string) {
        // FIXME: placeholder
        const response = await fetch(this.baseHttpUrl + "/api/user/login", {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({
                "user_id": user_id,
                "password": password
            })
        })
        if (!response.ok) {
            throw new Error(`Failed to log as ${user_id}`)
        }

        const json_data = await response.json();
        this.sessionData = {
            user_id: json_data.user_id,
            display_name: json_data.display_name
        }
    }

    public logout(): void {
        this.sessionData = undefined;
    }

    public isAuthenticated(): boolean {
        return this.sessionData != undefined;
    }
}