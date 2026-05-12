import { createSignal } from "solid-js";
import { NodeServerClient } from "../websocket/websocket-handler";
import { ClientMessages, InstanceCommands, InstanceStates, LoopStates, ServerMessages } from "../websocket/websocket-protocol";

export class StateController {
    private _client: NodeServerClient;

    private _instance_state: () => InstanceStates;
    private _set_instance_state: (state: InstanceStates) => void;

    private _loop_state: () => LoopStates;
    private _set_loop_state: (state: LoopStates) => void;

    public constructor(websocket_client: NodeServerClient) {
        this._client = websocket_client;

        const [instanceState, setInstanceState] = createSignal(InstanceStates.WAITING);
        this._instance_state = instanceState;
        this._set_instance_state = setInstanceState;

        const [loopState, setLoopState] = createSignal(LoopStates.WAIT_STEP);
        this._loop_state = loopState;
        this._set_loop_state = setLoopState;
        this.setup_handlers();
    }

    private setup_handlers() {
        this._client.add_handler(ServerMessages.SYNC_INSTANCE_STATE, (message) => {
            const instance_state = message.payload.instance_state as InstanceStates;
            const loop_state = message.payload.loop_state as LoopStates;
            this._set_instance_state(instance_state);
            this._set_loop_state(loop_state);
        });
    }

    get instance_state() {return this._instance_state();}
    get loop_state() {return this._loop_state(); }

    public request_play() {
        if (this._client) {
            this._client.sendCommand({type: ClientMessages.INSTANCE_COMMAND, payload: {action: InstanceCommands.RUN}})
        }
    }

    public request_stop() {
        if (this._client) {
            this._client.sendCommand({type: ClientMessages.INSTANCE_COMMAND, payload: {action: InstanceCommands.STOP}})
        }
    }
}