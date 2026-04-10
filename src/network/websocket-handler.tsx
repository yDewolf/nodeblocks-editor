import { ClientCommand, ServerMessage } from "./request-types";

export class NodeServerClient {
    private socket: WebSocket | null = null;
    private baseUrl: string;
    
    private is_connecting: boolean = false;
    private message_handlers: Map<string, ((message: ServerMessage) => void)[]>

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

    public set_handler(message_type: string, handler_func: (message: ServerMessage) => void) {
        if (!this.message_handlers.has(message_type)) {
            this.message_handlers.set(message_type, []);
        }

        let handlers = this.message_handlers.get(message_type);
        if (handlers == null) {handlers = [];}
        this.message_handlers.set(message_type, [...handlers, handler_func])
    }

    private handleMessage(message: ServerMessage) {
        const handlers = this.message_handlers.get(message.type);
        if (handlers) {
            handlers.forEach((handler) => {
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