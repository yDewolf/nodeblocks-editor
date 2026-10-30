import { UserSessionData } from './protocols/user-session';
import { createStore, SetStoreFunction } from 'solid-js/store';
import { loginAction, logoutAction } from '~/server/session';

interface SessionStore {
    user_session?: UserSessionData
}

export class AppSessionManager {
    private _sessionStore: SessionStore;
    private _setSessionStore: SetStoreFunction<SessionStore>;

    // Server urls
    public readonly baseHttpUrl: string;
    public readonly baseWsUrl: string;

    constructor(host: string = "localhost", port: number = 8080) {
        [this._sessionStore, this._setSessionStore] = createStore<SessionStore>({
            
        });
        
        this.baseHttpUrl = `http://${host}:${port}`;
        this.baseWsUrl = `ws://${host}:${port}`;
    }

    get userSession() { return this._sessionStore.user_session; }
    public setUserSession(user_session?: UserSessionData | null) {
        if (!user_session?.user_id) {
            return;
        }
        this._setSessionStore("user_session", user_session ?? undefined);
    }

    public async login(user_id: string, password?: string): Promise<void> {
        try {
            const session = await loginAction(user_id, password);
            this._setSessionStore("user_session", session);
        } catch (error: any) {
            throw new Error(`Failed to log as ${user_id}: ${error.message || 'Unknown Error'}`);
        }
    }

    public async logout(): Promise<void> {
        try {
            await logoutAction();
            this._setSessionStore("user_session", undefined);
        } catch (error) {
            console.error("Failed to logout:", error);
        }
    }

    public isAuthenticated(): boolean {
        return this.userSession != null;
    }
}