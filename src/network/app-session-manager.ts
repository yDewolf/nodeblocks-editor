import { UserSessionData } from './protocols/user-session';
import { createStore, SetStoreFunction } from 'solid-js/store';
import { loginAction, logoutAction } from '~/server/session';

interface SessionStore {
    user_session?: UserSessionData
}

type LoginListener = (session: UserSessionData) => void;
type LogoutListener = () => void;

export class AppSessionManager {
    private _sessionStore: SessionStore;
    private _setSessionStore: SetStoreFunction<SessionStore>;

    // Server urls
    public readonly baseHttpUrl: string;
    public readonly baseWsUrl: string;

    private _loginListeners: Set<LoginListener> = new Set();
    private _logoutListeners: Set<() => void> = new Set();

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

        if (this.userSession) {
            this.notifyLogin(this.userSession);
        }
    }

    public async logout(): Promise<void> {
        try {
            await logoutAction();
            this._setSessionStore("user_session", undefined as any);
        } catch (error) {
            console.error("Failed to logout:", error);
        }

        if (!this.userSession) {
            this.notifyLogout();
        }
    }

    public isAuthenticated(): boolean {
        return this.userSession != null;
    }

    // -- event subscribers

    public listenLogin(listener: LoginListener): () => void {
        this._loginListeners.add(listener);
        return () => this._loginListeners.delete(listener);
    }

    public listenLogout(listener: LogoutListener): () => void {
        this._logoutListeners.add(listener);
        return () => this._logoutListeners.delete(listener);
    }

    private notifyLogin(session: UserSessionData): void {
        this._loginListeners.forEach((listener) => listener(session));
    }

    private notifyLogout(): void {
        this._logoutListeners.forEach((listener) => listener());
    }
}