import { nanoid } from "nanoid";
import { ClientMessage, ServerMessage } from "./request-types";
import { ServerMessages, WebsocketStatus } from "./websocket-protocol";
import { setStore, storage } from "./session-store";
import { createSignal } from "solid-js";

type MessageByType<MessageType extends ServerMessages> = Extract<ServerMessage, {type: MessageType}>

export class NodeServerClient {
    private _socket: () => WebSocket | null;
    private _set_socket: (socket: WebSocket | null) => void;
    private _base_socket_url: string;
    private _base_http_url: string;

    private _session_token: string | undefined = undefined;
    private _user_id: string | undefined = undefined;
    
    private is_connecting: boolean = false;
    private message_handlers: Map<ServerMessages, Map<string, ((message: any) => void)>>

    constructor(host: string = "localhost", port: number = 3001) {
        const [socket, setSocket] = createSignal(null);
        this._socket = socket;
        this._set_socket = setSocket;

        this._base_socket_url = `ws://${host}:${port}`;
        this._base_http_url = `http://${host}:${port}`;
        this.message_handlers = new Map();
        this._session_token = storage.session == "" ? undefined : storage.session;
        this._setup_default_handlers();
    }

    get socket() {return this._socket()}
    set socket(socket: WebSocket | null) {this._set_socket(socket)}

    get user_id() { return this._user_id; }
    get session_token() { return this._session_token }
    get base_socket_url() { return this._base_socket_url }
    get base_http_url() { return this._base_http_url }

    private _setup_default_handlers() {
        this.add_handler(ServerMessages.HANDSHAKE_SYNC, (message) => {
            if (message.status != WebsocketStatus.CONNECTED) return;
            if ("session" in message) {
                this._session_token = message.session;
                setStore({"session": this._session_token});
            }
        });
    }

    public connect(userId: string, token?: string): Promise<void> | null {
        if (this.is_connecting || (this.socket && this.socket.readyState == WebSocket.OPEN)) {
            return null;
        }
        
        if (token) this._session_token = token;

        this._user_id = userId;
        this.is_connecting = true;
        return new Promise((resolve, reject) => {
            try {
                const url = new URL(`${this._base_socket_url}/ws/instance/${userId}`);
                if (this._session_token) {
                    url.searchParams.append("token", this._session_token);
                }

                console.log(`Trying to connect to ${url.toString()}`);
                this.socket = new WebSocket(url.toString());

                this.socket.onopen = (event) => {
                    this.is_connecting = false;
                    console.log(`[Connected] to ${url.toString()}`, event);
                    resolve();
                };

                this.socket.onerror = (err) => {
                    console.log("Something went wrong with websocket");
                    this.socket = null;
                    this.is_connecting = false;
                    reject(err);
                };
                this.socket.onmessage = (event) => {
                    const data: ServerMessage = JSON.parse(event.data);
                    this.handleMessage(data);
                };

                this.socket.onclose = () => {
                    console.log("[Disconnected]");
                    this.is_connecting = false;
                    this.disconnect();
                };
            } catch (err) {
                this.is_connecting = false;
                reject(err)
            }
        });
    }

    public add_handler<MessageType extends ServerMessages>(message_type: MessageType, handler_func: (message: MessageByType<MessageType>) => void): string{
        let handlers = this.message_handlers.get(message_type);
        if (handlers == undefined) {handlers = new Map();}
        const handler_id = nanoid(6);
        
        handlers.set(handler_id, handler_func)
        this.message_handlers.set(message_type, handlers)
        return handler_id;
    }

    public remove_handler(handler_type: ServerMessages, handler_id: string) {
        const handlers = this.message_handlers.get(handler_type);
        if (handlers) {
            return handlers.delete(handler_id);
        }
    }

    private handleMessage(message: ServerMessage) {
        const handlers = this.message_handlers.get(message.type);
        if (handlers) {
            handlers.forEach((handler, key) => {
                handler(message);
            });
        }
    }

    public sendCommand(command: ClientMessage) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            console.log("Sending", command)
            this.socket.send(JSON.stringify(command));
        }
    }

    public disconnect() {
        console.log("Closing Socket")
        this.socket?.close(1000, "Closed Workspace");
        this.socket = null;
    }

    public is_connected() {
        if (this.socket == null) return false;
        if (this.is_connecting) return false;
        
        return true;
    }
}