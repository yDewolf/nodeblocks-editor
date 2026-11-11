import { loginAction, logoutAction } from '~/server/user-session';
import { UserSessionData } from './protocols/user-session';
import { createStore, SetStoreFunction } from 'solid-js/store';
import { setServerUrlAction } from '~/server/connected-server';
import { createSignal, Setter } from 'solid-js';

interface SessionStore {
    user_session?: UserSessionData
}

type LoginListener = (session: UserSessionData) => void;
type LogoutListener = () => void;
type ServerListener = () => void;

export class AppSessionManager {
    private _sessionStore: SessionStore;
    private _setSessionStore: SetStoreFunction<SessionStore>;

    // Server urls
    private _host: string;
    private _port: number;

    private _baseHttpUrl: string;
    private _baseWsUrl: string;

    private _loginListeners: Set<LoginListener> = new Set();
    private _logoutListeners: Set<LogoutListener> = new Set();
    private _serverListeners: Set<ServerListener> = new Set();

    private _isConnectedToServer: () => boolean;
    private _setIsConnectedToServer: Setter<boolean>;

    constructor(host: string = "localhost", port: number = 8080) {
        [this._sessionStore, this._setSessionStore] = createStore<SessionStore>({
            
        });
        [this._isConnectedToServer, this._setIsConnectedToServer] = createSignal<boolean>(false);

        this._port = port;
        this._host = host;

        this._baseHttpUrl = `http://${host}:${port}`;
        this._baseWsUrl = `ws://${host}:${port}`;
    }

    get baseHttpUrl() { return this._baseHttpUrl; }
    get baseWsUrl() { return this._baseWsUrl; }

    get port() { return this._port; }
    get host() { return this._host; }

    get userSession() { return this._sessionStore.user_session; }
    get isConnectedToServer() { return this._isConnectedToServer(); }

    public setUserSession(user_session?: UserSessionData | null) {
        if (!user_session?.user_id) {
            return;
        }
        this._setSessionStore("user_session", user_session ?? undefined);
    }

    public async tryConnectToServer(serverHost: string, serverPort: number) {
        try {
            const serverUrl = `http://${serverHost}:${serverPort}`;
            console.log("[AppSession] trying to connect to: ", serverUrl);
            const success = await setServerUrlAction(serverUrl);
            if (!success) {
                throw Error();
            }
            
            this._setIsConnectedToServer(true);
            this.changeServer(serverHost, serverPort);
            if (this.userSession) {
                await this.login(this.userSession?.user_id);
            }
        } catch (err) {
            console.error("Failed to connect to server: ", err);
        }
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

    public listenServerChange(listener: ServerListener): () => void {
        this._serverListeners.add(listener);
        return () => this._serverListeners.delete(listener);
    }

    private notifyLogin(session: UserSessionData): void {
        this._loginListeners.forEach((listener) => listener(session));
    }

    private notifyLogout(): void {
        this._logoutListeners.forEach((listener) => listener());
    }

    private notifyServerChanged(): void {
        this._serverListeners.forEach((listener) => listener());
    }

    // -- other

    private changeServer(host: string, port: number) {
        this._port = port;
        this._host = host;

        
        this._baseHttpUrl = `http://${host}:${port}`;
        this._baseWsUrl = `ws://${host}:${port}`;
        console.log("[AppSession] changed server url to: ", this.baseHttpUrl);
        this.notifyServerChanged();
    }
}