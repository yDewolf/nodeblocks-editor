import { AppSessionManager } from "~/network/app-session-manager";
import { ClientCommand } from "~/protocols/nodeblocks/network/message/client-commands";
import { ServerMessages, ServerMessageTypes } from "~/protocols/nodeblocks/network/server-message-protocol";
import { PackageManager } from "../engine/packages/package-manager";
import { PackageManifest } from "~/protocols/nodeblocks/manifests/package-manifest";
import { ServerMessage } from "~/protocols/nodeblocks/network/message/server-messages";

type MessageByType<MessageType extends ServerMessages | ServerMessageTypes> = Extract<ServerMessage, {type: MessageType}>

export class SceneConnectionManager {
    private socket: WebSocket | null  = null;
    private sceneToken: string | null = null;
    
    public isConnecting: boolean = false;
    
    private commandQueue: ClientCommand[] = [];
    private messageListeners: Map<ServerMessageTypes, Set<(msg: any) => void>> = new Map();

    constructor(
        private appSession: AppSessionManager,
        private packageManager: PackageManager
    ) {}

    public async connect(sceneId: string): Promise<void> {
        if (!this.appSession.isAuthenticated()) {
            throw new Error("User must be logged to connect to a scene");
        }

        if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) {
            return;
        }

        this.isConnecting = true;

        try {
            this.sceneToken = await this.fetchSceneToken(sceneId);

            await this.fetchAndLoadManifests();
            await this.establishWebSocketConnection();
        } catch (error) {
            this.isConnecting = false;
            console.error("[SceneConnection] Failed to connect to scene:", error);
            throw error;
        }
    }

    private async fetchSceneToken(scene_id: string): Promise<string> {
        const response = await fetch(`${this.appSession.baseHttpUrl}/api/scene/${scene_id}/token`, {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ user_id: this.appSession.sessionData?.user_id })
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
                this.isConnecting = false;
                this.flushCommandQueue();
                console.log("[SceneConnection] Connected to scene socket");
                resolve();
            };

            this.socket.onerror = (error) => {
                this.isConnecting = false;
                this.socket = null;
                reject(error);
            };

            this.socket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                this.dispatchMessage(message);
            };

            this.socket.onclose = () => {
                this.isConnecting = false;
                this.socket = null;
                this.dispatchMessage({type: ServerMessageTypes.CLOSE_SOCKET});
                console.log("[SceneConnection] Disconnected.");
            };
        });
    }



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

    public onMessage<MessageType extends ServerMessageTypes>(type: MessageType, handler_func: (msg: MessageByType<MessageType>) => void): () => void {
        if (!this.messageListeners.has(type)) {
            this.messageListeners.set(type, new Set());
        }
        
        this.messageListeners.get(type)!.add(handler_func);
        return () => {
            this.messageListeners.get(type)?.delete(handler_func);
        };
    }

    private dispatchMessage(message: ServerMessage): void {
        const typeListeners = this.messageListeners.get(message.type);
        if (typeListeners) {
            for (const listener of typeListeners) {
                listener(message);
            }
        }
    }

    public disconnect(): void {
        if (this.socket) {
            this.socket.close(1000, "User disconnected from scene");
            this.socket = null;
        }
    }

    public isConnected(): boolean {
        return this.socket?.readyState === WebSocket.OPEN;
    }
}