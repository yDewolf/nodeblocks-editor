import { createStore, SetStoreFunction } from "solid-js/store";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { makePersisted } from '@solid-primitives/storage';

export interface LocalServerState {
    isInstalled: boolean;
    installedVersion?: string;
    isRunning: boolean;
    isStarting: boolean;
    logs: string[];
}

const LOCAL_SERVER_CACHE_KEY = "local-server-cache"

export class LocalServerController {
    private _state: LocalServerState;
    private _setState: SetStoreFunction<LocalServerState>;
    private _unlistenLog?: UnlistenFn;

    constructor() {
        [this._state, this._setState] = makePersisted(createStore<LocalServerState>({
            isInstalled: false,
            isRunning: false,
            isStarting: false,
            logs: [],
        }), {name: LOCAL_SERVER_CACHE_KEY});
        this.setup();
    }

    get installedVersion() { return this._state.installedVersion; }
    get isInstalled() { return this._state.isInstalled; }
    get isRunning() { return this._state.isRunning; }
    get isStarting() { return this._state.isStarting; }
    get logs() { return this._state.logs; }

    private setup() {
        this.checkIsInstalled();
        this.checkStatus();
        this.initListener();
    }

    private async initListener() {
        if (!window.isTauriEnvironment || this._unlistenLog) return;
        try {
            this._unlistenLog = await listen<string>("server-log", (event) => {
                this._setState("logs", (prevLogs) => [...prevLogs.slice(-199), event.payload]);
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
    }

    public async checkIsInstalled() {
        if (!window.isTauriEnvironment) return;
        try {
            const is_installed = await invoke<boolean>("check_server_installed");
            this._setState("isInstalled", is_installed);
            this.checkInstalledVersion();
        } catch (err) {
            console.error("Failed to check local server status:", err)
        }
    }

    public async checkStatus() {
        if (!window.isTauriEnvironment) return;
        try {
            const isRunning = await invoke<boolean>("is_local_server_running");
            this._setState("isRunning", isRunning);
        } catch (err) {
            console.error("Failed to check local server status:", err);
        }
    }

    public async startServer(): Promise<void> {
        if (!window.isTauriEnvironment) return;
        this._setState("isStarting", true);
        try {
            await invoke("start_local_server");
            this._setState("isRunning", true);
        } catch (err) {
            console.error("Failed to start local server:", err);
            throw err;
        } finally {
            this._setState("isStarting", false);
        }
    }

    public async stopServer(): Promise<void> {
        if (!window.isTauriEnvironment) return;
        try {
            await invoke("stop_local_server");
            this._setState("isRunning", false);
        } catch (err) {
            console.error("Failed to stop local server:", err);
            throw err;
        }
    }

    public async checkInstalledVersion() {
        try {
            const version = await invoke<string>("get_local_server_version");
            console.log("Installed server version:", version);
            this._setState("installedVersion", version);
            return version;
        } catch (error) {
            console.error("Couldn't get local server version:", error);
            return null;
        }
    }
}

export const localServerController = new LocalServerController();
