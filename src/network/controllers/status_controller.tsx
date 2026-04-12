import { createSignal } from "solid-js";
import { NodeServerClient } from "../websocket/websocket-handler";
import { InstanceStates, LoopStates, ClientMessages, InstanceCommands, WebsocketStatus, ServerMessages } from "../websocket/websocket-protocol";

export class WebsocketStatusController {
    private _client: NodeServerClient;

    private _websocket_status: () => WebsocketStatus;
    private _set_websocket_status: (state: WebsocketStatus) => void;

    public constructor(websocket_client: NodeServerClient) {
        this._client = websocket_client;

        const [websocketStatus, setWebsocketStatus] = createSignal(WebsocketStatus.DISCONNECTED);
        this._websocket_status = websocketStatus;
        this._set_websocket_status = setWebsocketStatus;

        this.setup_handlers();
    }

    private setup_handlers() {
        this._client.add_handler(ServerMessages.HANDSHAKE_SYNC, (message) => {
            if ("status" in message) {
                const status = message.status as WebsocketStatus;
                this._set_websocket_status(status);
                return;
            }
            this._set_websocket_status(WebsocketStatus.ERROR);
        });
    }

    get status() { return this._websocket_status(); }

    public request_disconnect() {
        if (this._client) {
            this._client.disconnect();
        }
    }

    // TODO:
    public request_connect() {

    }
}