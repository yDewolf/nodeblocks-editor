import { createSignal, Setter } from 'solid-js';
import { UserSessionData } from './protocols/user-session';

export class AppSessionManager {
    private _sessionData: () => UserSessionData | null;
    private _setSessionData: Setter<UserSessionData | null>;

    // Server urls
    public readonly baseHttpUrl: string;
    public readonly baseWsUrl: string;

    constructor(host: string = "localhost", port: number = 8080) {
        [this._sessionData, this._setSessionData] = createSignal<UserSessionData | null>(null);
        
        this.baseHttpUrl = `http://${host}:${port}`;
        this.baseWsUrl = `ws://${host}:${port}`;
    }

    get sessionData() { return this._sessionData(); }

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
        this._setSessionData({
            user_id: json_data.user_id,
            display_name: json_data.display_name
        });
    }

    public logout(): void {
        this._setSessionData(null);
    }

    public isAuthenticated(): boolean {
        return this.sessionData != null;
    }
}