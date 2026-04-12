import { nanoid } from "nanoid";
import { ClientCommand, ServerMessage } from "./request-types";
import { ServerMessages } from "./websocket-protocol";

type MessageByType<MessageType extends ServerMessages> = Extract<ServerMessage, {type: MessageType}>

export class NodeServerClient {
    private socket: WebSocket | null = null;
    private baseUrl: string;
    
    private is_connecting: boolean = false;
    private message_handlers: Map<ServerMessages, Map<string, ((message: any) => void)>>

    constructor(host: string = "localhost", port: number = 3001) {
        this.baseUrl = `ws://${host}:${port}`;
        this.message_handlers = new Map();
    }

    public connect(userId: string, subRoute: string = ""): Promise<void> | null {
        if (this.is_connecting || (this.socket && this.socket.readyState == WebSocket.OPEN)) {
            return null;
        }
        
        this.is_connecting = true;
            return new Promise((resolve, reject) => {
                try {
                    const url = `${this.baseUrl}/instance/${userId}/`;
                    console.log(`Trying to connect to ${url}`);
                    this.socket = new WebSocket(url);
    
                    this.socket.onopen = (event) => {
                        this.is_connecting = false;
                        console.log(`[Connected] to ${url}`, event);
                        resolve();
                    };
    
                    this.socket.onerror = (err) => {
                        console.log("Something went wrong with websocket");
                        this.socket = null;
                        this.is_connecting = false;
                        reject(new Error("Failed to connect to NodeServer"));
                    };
                    this.socket.onmessage = (event) => {
                        const data: ServerMessage = JSON.parse(event.data);
                        this.handleMessage(data);
                    };
    
                    this.socket.onclose = () => {
                        console.log("[Disconnected]");
                        this.socket = null;
                    };
                } catch (err) {
                    this.is_connecting = false;
                    reject(err)
                }
            });
    }

    public add_handler<MessageType extends ServerMessages>(message_type: MessageType, handler_func: (message: MessageByType<MessageType>) => void): string{
        if (!this.message_handlers.has(message_type)) {
            this.message_handlers.set(message_type, new Map());
        }

        let handlers = this.message_handlers.get(message_type);
        if (handlers == null) {handlers = new Map();}
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
            })
        }
    }

    public sendCommand(command: ClientCommand) {
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
}