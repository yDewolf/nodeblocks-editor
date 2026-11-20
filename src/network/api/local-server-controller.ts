import { createStore, SetStoreFunction } from "solid-js/store";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { makePersisted } from '@solid-primitives/storage';
import { releaseController } from "./github/github-release-controller";

export enum LocalServerStates {
    STARTING = "starting",
    RUNNING = "running",
    STOPPED = "stopped"
}

export interface LocalServerState {
    isIncompatible: boolean;
    isInstalled: boolean;
    installedVersion?: string;
    serverState: LocalServerStates;
}

interface LogsStore {
    logs: string[];
}

const LOCAL_SERVER_CACHE_KEY = "local-server-cache";
const LOCAL_SERVER_LOGS = "local-server-logs";

export class LocalServerController {
    private _state: LocalServerState;
    private _setState: SetStoreFunction<LocalServerState>;

    private _unlistenLog?: UnlistenFn;
    private _unlistenExit?: UnlistenFn;

    private _logsStore: LogsStore;
    private _setLogsStore: SetStoreFunction<LogsStore>;

    private _host: string = "127.0.0.1";
    private _port: number = 8080;

    constructor() {
        [this._state, this._setState] = makePersisted(createStore<LocalServerState>({
            isInstalled: false,
            serverState: LocalServerStates.STOPPED,
            isIncompatible: false
        }), {name: LOCAL_SERVER_CACHE_KEY});
        [this._logsStore, this._setLogsStore] = makePersisted(
            createStore<LogsStore>({ 
                logs: []
            }), {
                name: LOCAL_SERVER_LOGS,
                storage: sessionStorage
            }
        );
        this.setup();
    }

    get host() { return this._host; }
    get port() { return this._port; }

    get localUrl() { return `http://${this._host}:${this._port}`}

    get isInstalledVersionIncompatible() { return this._state.isIncompatible; }
    get installedVersion() { return this._state.installedVersion; }
    get isInstalled() { return this._state.isInstalled; }

    get state() { return this._state.serverState }
    get isRunning() { return this._state.serverState == LocalServerStates.RUNNING; }
    get isStarting() { return this._state.serverState == LocalServerStates.STARTING; }

    get logs() { return this._logsStore.logs; }

    private setup() {
        this.checkIsInstalled();
        this.checkStatus();
        this.initListener();
    }

    private async initListener() {
        if (!window.isTauriEnvironment || this._unlistenLog) return;
        try {
            this._unlistenLog = await listen<string>("server-log", (event) => {
                this._setLogsStore("logs", (prevLogs) => [...prevLogs.slice(-199), event.payload]);
            });
            this._unlistenExit = await listen("server-exited", (event) => {
                console.warn("Local server died.");
            });
        } catch (err) {
            console.error("Failed to listen to server-log:", err);
        }
    }

    public cleanup() {
        if (this._unlistenLog) {
            this._unlistenLog();
            this._unlistenLog = undefined;
        }
        if (this._unlistenExit) {
            this._unlistenExit();
            this._unlistenExit = undefined;
        }
    }

    public onWindowClose() {
        this.cleanup();
        this.clearLogs();
    }

    public clearLogs() {
        this._setLogsStore("logs", []);
    }

    public async installEnvironment(wheelUrl: string) {
        if (!window.isTauriEnvironment) return;
        try {
            await invoke("ensure_environment", {wheelUrl: wheelUrl, removePrevious: true});
            this.checkIsInstalled();
        } catch (err) {
            console.error("Failed to install server environment", err);
        }
    }

    public async checkIsInstalled() {
        if (!window.isTauriEnvironment) return;
        try {
            const is_installed = await invoke<boolean>("check_server_installed");
            this._setState("isInstalled", is_installed);
            this.checkInstalledVersion();
            return this.isInstalled;
        
        } catch (err) {
            console.error("Failed to check local server status:", err);
        }
    }

    public async checkStatus() {
        if (!window.isTauriEnvironment) return;
        try {
            const isRunning = await invoke<boolean>("is_local_server_running");
            if (isRunning) {
                this._setState("serverState", LocalServerStates.RUNNING);
            } else {
                this._setState("serverState", LocalServerStates.STOPPED);
            }
            return this.state;
        } catch (err) {
            console.error("Failed to check local server status:", err);
        }
    }

    public async startServer(): Promise<void> {
        if (!window.isTauriEnvironment) return;
        this._setState("serverState", LocalServerStates.STARTING);
        try {
            await invoke("start_local_server");
            this.clearLogs();
            this._setState("serverState", LocalServerStates.RUNNING);
            this.checkLocalServerHost();
            this.checkStatus();
        
        } catch (err) {
            console.error("Failed to start local server:", err);
            throw err;
        }
    }

    public async stopServer(): Promise<void> {
        if (!window.isTauriEnvironment) return;
        try {
            await invoke("stop_local_server");
            this._setState("serverState", LocalServerStates.STOPPED);
            this.checkStatus(); 
        } catch (err) {
            console.error("Failed to stop local server:", err);
            throw err;
        }
    }

    public async checkLocalServerHost(): Promise<[string, number] | null> {
        if (!window.isTauriEnvironment) return null;
        
        const result =  await invoke<[string, number] | null>("get_server_host_and_port");
        if (result) {
            this._host = result[0];
            this._port = result[1];
        }
        return result;
    }

    public async checkInstalledVersion() {
        try {
            const version = await invoke<string>("get_local_server_version");
            console.log("Installed server version:", version);
            this._setState("installedVersion", version);

            const notCompatible = releaseController.checkMightNotBeCompatible(version);
            this._setState("isIncompatible", notCompatible);
            return version;
        } catch (error) {
            console.error("Couldn't get local server version:", error);
            return null;
        }
    }
}

export const localServerController = new LocalServerController();
