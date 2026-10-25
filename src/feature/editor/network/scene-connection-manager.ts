import { AppSessionManager } from "~/network/app-session-manager";
import { ClientCommand } from "~/protocols/nodeblocks/network/message/client-commands";
import { ServerMessages, ServerMessageTypes, WebsocketStatus } from "~/protocols/nodeblocks/network/server-message-protocol";
import { PackageManager } from "../engine/packages/package-manager";
import { PackageManifest } from "~/protocols/nodeblocks/manifests/package-manifest";
import { ServerMessage } from "~/protocols/nodeblocks/network/message/server-messages";
import { WorkerEventPayload } from "~/protocols/nodeblocks/network/message/server/payloads/worker-event-payloads";
import { ServerCmdResponse, ServerEngineEvent, ServerSceneMessages, ServerWorkerEvent } from "~/protocols/nodeblocks/network/message/server/server-scene-messages";
import { EngineEventPayload } from "~/protocols/nodeblocks/network/message/server/payloads/engine-event-payloads";
import { ServerCmdResponsePayload } from "~/protocols/nodeblocks/network/message/server/payloads/server-response-payloads";
import { createSignal } from "solid-js";
import { isServer } from "solid-js/web";

type MessageByType<MessageType extends ServerMessages | ServerMessageTypes> = 
    Extract<ServerMessage, {type: MessageType}>;

type ExtractCmdResponse<T extends ServerCmdResponsePayload["type"]> = 
    {response_payload: Extract<ServerCmdResponsePayload, { type: T }>;};

type ExtractWorkerEvent<T extends WorkerEventPayload["type"]> = 
    {event_payload: Extract<WorkerEventPayload, { type: T }>;};

type ExtractEngineEvent<T extends EngineEventPayload["type"]> = 
    {event_payload: Extract<EngineEventPayload, { type: T }>;};

export class SceneConnectionManager {
    private _status: () => WebsocketStatus;
    private _setStatus: (status: WebsocketStatus) => void;

    private socket: WebSocket | null  = null;
    private sceneToken: string | null = null;
    private _sceneId: string | null = null;
    
    public isConnecting: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 10;
    private reconnectTimer: number | null = null;
    private isIntentionalDisconnect: boolean = false;

    private commandQueue: ClientCommand[] = [];
    private messageListeners: Map<ServerMessageTypes, Set<(msg: any) => void>> = new Map();

    private commandResponseListeners: Map<string, Set<(msg: ServerCmdResponse) => void>> = new Map();
    private workerEventListeners: Map<string, Set<(msg: ServerWorkerEvent) => void>> = new Map();
    private engineEventListeners: Map<string, Set<(msg: ServerEngineEvent) => void>> = new Map();
    
    private _connectListeners: Set<(sceneConn: SceneConnectionManager) => void> = new Set();

    get sceneId() { return this._sceneId; }

    constructor(
        private appSession: AppSessionManager,
        private packageManager: PackageManager
    ) {
        [this._status, this._setStatus] = createSignal(WebsocketStatus.DISCONNECTED);
    }

    get status() { return this._status(); }
    get isConnected() { return this._status() == WebsocketStatus.CONNECTED; }

    public onConnect(listener: (sceneConn: SceneConnectionManager) => void) {
        this._connectListeners.add(listener);
        return () => this._connectListeners.delete(listener);
    }

    private notifyConnected() {
        this._connectListeners.forEach((listener) => listener(this));
    }

    public async connect(sceneId: string): Promise<void> {
        if (!this.appSession.isAuthenticated()) {
            throw new Error("User must be logged to connect to a scene");
        }

        if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) {
            return;
        }

        this.isIntentionalDisconnect = false;
        this.isConnecting = true;
        this._setStatus(WebsocketStatus.CONNECTING);

        try {
            this.sceneToken = await this.fetchSceneToken(sceneId);
            this._sceneId = sceneId;
            
            await this.fetchAndLoadManifests();
            await this.establishWebSocketConnection();
        } catch (error) {
            this.isConnecting = false;
            console.error("[SceneConnection] Failed to connect to scene:", error);
            
            this.handleReconnect();
            return;
            // throw error;
        }
        this.notifyConnected();
    }

    public disconnect(): void {
        this.isIntentionalDisconnect = true;
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.socket) {
            this.socket.close(1000, "User disconnected from scene");
            this.socket = null;
        }
    }

    private async fetchSceneToken(scene_id: string): Promise<string> {
        const response = await fetch(`${this.appSession.baseHttpUrl}/api/scene/${scene_id}/token`, {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ user_id: this.appSession.userSession?.user_id })
        });

        if (!response.ok) {
            throw new Error("Failed to generate scene connection token");
        }

        const data = await response.json();
        return data.token;
    }

    private async fetchAndLoadManifests(): Promise<void> {
        const response = await fetch(`${this.appSession.baseHttpUrl}/api/plugins/manifests`);
        if (!response.ok) {
            throw new Error("Failed to fetch package manifests");
        }

        const json_data = await response.json();
        const manifests: PackageManifest[] = json_data.loaded_manifests;
        this.packageManager.loadPackages(manifests);
        console.log("[SceneConnection] Loaded manifests: ", manifests);
    }

    private establishWebSocketConnection(): Promise<void> {
        return new Promise((resolve, reject) => {
            const websocketUrl = new URL(`${this.appSession.baseWsUrl}/ws/scene`);
            websocketUrl.searchParams.append("token", this.sceneToken!);

            this.socket = new WebSocket(websocketUrl.toString());

            this.socket.onopen = () => {
                this._setStatus(WebsocketStatus.CONNECTED);
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                if (this.reconnectTimer) {
                    clearTimeout(this.reconnectTimer);
                    this.reconnectTimer = null;
                }
                
                this.flushCommandQueue();
                console.log("[SceneConnection] Connected to scene socket");
                resolve();
            };

            this.socket.onerror = (error) => {
                this._setStatus(WebsocketStatus.ERROR);
                this.isConnecting = false;
                this.socket = null;
                reject(error);
            };

            this.socket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                this.dispatchMessage(message);
            };

            this.socket.onclose = () => {
                this._setStatus(WebsocketStatus.DISCONNECTED);
                this.isConnecting = false;
                this.socket = null;
                this.dispatchMessage({type: ServerMessageTypes.CLOSE_SOCKET});
                console.log("[SceneConnection] Disconnected.");

                if (!this.isIntentionalDisconnect) {
                    this.handleReconnect();
                }
            };
        });
    }

    private handleReconnect() {
        if (isServer) return;
        console.log(this.isIntentionalDisconnect, this.sceneId);
        if (this.isIntentionalDisconnect || !this._sceneId) return;

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this._sceneId = null;
            console.error("[SceneConnection] Maximum reconnection attempts reached. Giving up.");
            return;
        }

        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 15000);
        this.reconnectAttempts++;

        console.log(`[SceneConnection] Reconnecting in ${delay}ms (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }

        this.reconnectTimer = window.setTimeout(async () => {
            if (this.isIntentionalDisconnect || !this._sceneId) return;
            try {
                await this.connect(this._sceneId);
            } catch (error) {

            }
        }, delay);
    }

    // -- Events and Commands

    public sendCommand(command: ClientCommand): void {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(command));
        } else {
            this.commandQueue.push(command);
        }
    }

    private flushCommandQueue(): void {
        while (this.commandQueue.length > 0) {
            const command = this.commandQueue.shift();
            if (command) this.sendCommand(command);
        }
    }

    public onMessage<MessageType extends ServerMessageTypes>(
        type: MessageType, 
        handler_func: (msg: MessageByType<MessageType>) => void
    ): () => void {
        if (!this.messageListeners.has(type)) {
            this.messageListeners.set(type, new Set());
        }
        
        this.messageListeners.get(type)!.add(handler_func);
        return () => {
            this.messageListeners.get(type)?.delete(handler_func);
        };
    }

    public onCommandResponse<T extends ServerCmdResponsePayload["type"]>(
        responseType: T,
        handler_func: (msg: ExtractCmdResponse<T>) => void
    ): () => void {
        const subType = responseType as string;
        if (!this.commandResponseListeners.has(subType)) {
            this.commandResponseListeners.set(subType, new Set());
        }
        
        this.commandResponseListeners.get(subType)!.add(handler_func as any);
        return () => {
            this.commandResponseListeners.get(subType)?.delete(handler_func as any);
        };
    }

    public onWorkerEvent<T extends WorkerEventPayload["type"]>(
        eventType: T,
        handler_func: (msg: ExtractWorkerEvent<T>) => void
    ): () => void {
        const subType = eventType as string;
        if (!this.workerEventListeners.has(subType)) {
            this.workerEventListeners.set(subType, new Set());
        }
        
        this.workerEventListeners.get(subType)!.add(handler_func as any);
        return () => {
            this.workerEventListeners.get(subType)?.delete(handler_func as any);
        };
    }

    public onEngineEvent<T extends EngineEventPayload["type"]>(
        eventType: T,
        handler_func: (msg: ExtractEngineEvent<T>) => void
    ): () => void {
        const subType = eventType as string;
        if (!this.engineEventListeners.has(subType)) {
            this.engineEventListeners.set(subType, new Set());
        }
        
        this.engineEventListeners.get(subType)!.add(handler_func as any);
        return () => {
            this.engineEventListeners.get(subType)?.delete(handler_func as any);
        };
    }

    private dispatchMessage(message: ServerMessage): void {
        const typeListeners = this.messageListeners.get(message.type);
        if (typeListeners) {
            for (const listener of typeListeners) {
                listener(message);
            }
        }

        if (message.type === ServerMessageTypes.COMMAND_RESPONSE && message.response_payload) {
            const subListeners = this.commandResponseListeners.get(message.response_payload.type);
            if (subListeners) {
                for (const listener of subListeners) {
                    listener(message);
                }
            }
        }

        if (message.type === ServerMessageTypes.SCENE_EVENT && message.event_payload) {
            const subListeners = this.workerEventListeners.get(message.event_payload.type);
            if (subListeners) {
                for (const listener of subListeners) {
                    listener(message);
                }
            }
        }

        if (message.type === ServerMessageTypes.GRAPH_EVENT && message.event_payload) {
            const subListeners = this.engineEventListeners.get(message.event_payload.type);
            if (subListeners) {
                for (const listener of subListeners) {
                    listener(message);
                }
            }
        }
    }
}