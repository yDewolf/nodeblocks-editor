import { loginAction, logoutAction } from '~/server/user-session';
import { UserSessionData } from './protocols/user-session';
import { createStore, SetStoreFunction } from 'solid-js/store';
import { setServerUrlAction } from '~/server/connected-server';
import { createSignal, Setter } from 'solid-js';
import { ServerEventTypes, ServerStatuses, ServerStatusEvent } from '~/protocols/nodeblocks/network/server-events';

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

    // SSE stuff
    private _serverStatus: () => ServerStatuses;
    private _setServerStatus: Setter<ServerStatuses>;
    
    private _eventSource: EventSource | null = null;

    // Connection Retry
    private _connectAbortController: AbortController | null = null;
    private maxRetries: number = 5;
    private retryDelayMs: number = 2000;

    private maxReconnectErrors: number = 10;

    constructor(host: string = "localhost", port: number = 8080) {
        [this._sessionStore, this._setSessionStore] = createStore<SessionStore>({});
        [this._isConnectedToServer, this._setIsConnectedToServer] = createSignal<boolean>(false);
        [this._serverStatus, this._setServerStatus] = createSignal<ServerStatuses>(ServerStatuses.DISCONNECTED);

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
    get serverStatus() { return this._serverStatus(); }

    public setUserSession(user_session?: UserSessionData | null) {
        if (!user_session?.user_id) {
            return;
        }
        this._setSessionStore("user_session", user_session ?? undefined);
    }

    public disconnect(): void {
        if (this._connectAbortController) {
            this._connectAbortController.abort();
            this._connectAbortController = null;
        }

        this.disconnectServerEvents();
        this._setIsConnectedToServer(false);
        this._setServerStatus(ServerStatuses.DISCONNECTED);
        console.log("[AppSession] Disconnected from server.");
    }

    public async tryConnectToServer(serverHost: string, serverPort: number): Promise<boolean> {
        if (this._connectAbortController) {
            this._connectAbortController.abort();
        }

        this.disconnect();

        const abortController = new AbortController();
        this._connectAbortController = abortController;

        const serverUrl = `http://${serverHost}:${serverPort}`;
        console.log("[AppSession] trying to connect to: ", serverUrl);

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            if (abortController.signal.aborted) {
                return false;
            }

            try {
                const success = await setServerUrlAction(serverUrl);
                if (!success) {
                    throw Error("Failed to set server URL action");
                }
                
                if (abortController.signal.aborted) return false;
                const token = await this.fetchConnectionToken(serverUrl, abortController.signal);

                if (abortController.signal.aborted) return false;
                this.connectServerEvents(serverUrl, token);

                if (this._connectAbortController === abortController) {
                    this._connectAbortController = null;
                }
                
                this.changeServer(serverHost, serverPort);
                if (this.userSession) {
                    await this.login(this.userSession?.user_id);
                }
                return true;
            } catch (err) {
                console.warn(`[AppSession] Attempt ${attempt}/${this.maxRetries} - ${serverUrl}:`, err);
                this._setServerStatus(ServerStatuses.FAILED);
                if (attempt < this.maxRetries) {
                    try {
                        await this._wait(this.retryDelayMs, abortController.signal);
                    } catch (e) {
                        return false;
                    }
                }
            }
        }

        console.error(`[AppSession] Failed to connect to ${serverUrl} after ${this.maxRetries} tries`);
        if (this._connectAbortController === abortController) {
            this._connectAbortController = null;
        }
        this.disconnect();
        return false;
    }

    private async fetchConnectionToken(serverUrl: string, signal: AbortSignal): Promise<string> {
        const response = await fetch(`${serverUrl}/api/server/token`, {
            method: "POST",
            signal,
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch connection token: ${response.statusText}`);
        }
        return await response.json();
    }

    private connectServerEvents(serverUrl: string, token: string) {
        this.disconnectServerEvents();

        const eventsUrl = `${serverUrl}/api/server/events?token=${encodeURIComponent(token)}`;
        const eventSource = new EventSource(eventsUrl);
        this._eventSource = eventSource;

        eventSource.addEventListener(ServerEventTypes.SERVER_STATUS, (event: MessageEvent) => {
            try {
                const data = ({type: event.type as ServerEventTypes, ...JSON.parse(event.data)}) as ServerStatusEvent;
                if (data.status) {
                    console.log(`[AppSession] Server status updated: ${data.status} | message: ${data.message || ''}`);
                    this._setServerStatus(data.status);
                }
            } catch (err) {
                console.error("[AppSession] Error parsing server status event:", err);
            }
        });

        let consecutiveReconnectErrors: number = 0;
        eventSource.onerror = (error) => {
            console.warn("[AppSession] EventSource connection error:", error);
            if (eventSource.readyState == EventSource.CONNECTING) {
                this._setServerStatus(ServerStatuses.CONNECTING);
                if (this.serverStatus == ServerStatuses.CONNECTING) {
                    consecutiveReconnectErrors += 1;
                } else {
                    consecutiveReconnectErrors = 0;
                }
                
                if (consecutiveReconnectErrors >= this.maxReconnectErrors && this.maxReconnectErrors != 0) {
                    console.error("[AppSession] Server probably died. Disconnecting from SSE");
                    this.disconnect();
                }
            }
            if (eventSource.readyState == EventSource.CLOSED) {
                console.error("[AppSession] Server closed SSE connection");
                this.disconnect();
            }
        };

        eventSource.onopen = () => {
            console.log("[AppSession] Connected to SSE stream");
            this._setIsConnectedToServer(true);
        };
    }

    private disconnectServerEvents() {
        if (this._eventSource) {
            this._eventSource.close();
            this._eventSource = null;
        }
    }

    private _wait(ms: number, signal: AbortSignal): Promise<void> {
        return new Promise((resolve, reject) => {
            if (signal.aborted) {
                return reject(new Error("Aborted"));
            }
            const timer = setTimeout(() => {
                signal.removeEventListener("abort", onAbort);
                resolve();
            }, ms);

            const onAbort = () => {
                clearTimeout(timer);
                reject(new Error("Aborted"));
            };

            signal.addEventListener("abort", onAbort, { once: true });
        });
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