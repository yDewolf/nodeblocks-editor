import { createSignal } from "solid-js";
import { SceneConnectionManager } from "../network/scene-connection-manager";
import { ServerCmdResponseTypes, ServerEngineEventTypes } from "~/protocols/nodeblocks/network/server-message-protocol";
import { SceneWorkerExecutionMode, SceneWorkerExecutionState } from "~/protocols/nodeblocks/network/scene-worker-protocol";
import { CommandGroups, ExecutionShortcuts, SceneExecutionCmdTypes } from "~/protocols/nodeblocks/network/client-command-protocol";
import { nanoid } from "nanoid";

export class StateController {
    private _runtime_state: () => SceneWorkerExecutionState;
    private _set_runtime_state: (state: SceneWorkerExecutionState) => void;

    private _runtime_mode: () => SceneWorkerExecutionMode;
    private _set_runtime_mode: (state: SceneWorkerExecutionMode) => void;

    public constructor(
        private readonly _client: SceneConnectionManager
    ) {
        [this._runtime_state, this._set_runtime_state] = createSignal(SceneWorkerExecutionState.STOPPED);

        [this._runtime_mode, this._set_runtime_mode] = createSignal(SceneWorkerExecutionMode.GRAPH_STEP);
        this.setup_handlers();
    }

    private setup_handlers() {
        this._client.onCommandResponse(ServerCmdResponseTypes.EXECUTION_STATE_SYNC, (message) => {
            // console.log(message);
            const runtime_state = message.response_payload.state as SceneWorkerExecutionState;
            const runtime_mode = message.response_payload.mode as SceneWorkerExecutionMode;
            this._set_runtime_state(runtime_state);
            this._set_runtime_mode(runtime_mode);
        });
    }

    get runtime_state() {return this._runtime_state();}
    get runtime_mode() {return this._runtime_mode(); }

    public isRunning() {
        return this.runtime_state == SceneWorkerExecutionState.RUNNING 
            || this.runtime_state == SceneWorkerExecutionState.RUNNING_CONTINUOUS

    }

    public requestModeUpdate(new_mode: SceneWorkerExecutionMode) {
        this._client.sendCommand({
            cmd_group: CommandGroups.EXECUTION,
            cmd_uid: nanoid(),
            type: SceneExecutionCmdTypes.SET_EXECUTION_MODE,
            mode: new_mode
        });
    }

    public request_play() {
        // TODO: adapt this to the new protocol
        if (this._client) {
            this._client.sendCommand({
                cmd_group: CommandGroups.EXECUTION,
                cmd_uid: nanoid(),
                type: SceneExecutionCmdTypes.SET_EXECUTION_STATE,
                state: SceneWorkerExecutionState.RUNNING
            })
        }
    }

    public requestContinue() {
        if (this._client) {
            this._client.sendCommand({
                cmd_group: CommandGroups.EXECUTION,
                cmd_uid: nanoid(),
                type: SceneExecutionCmdTypes.EXECUTION_SHORTCUT,
                shortcut: ExecutionShortcuts.EXECUTION_CONTINUE
            })
        }
    }

    public requestStep() {
        if (this._client) {
            this._client.sendCommand({
                cmd_group: CommandGroups.EXECUTION,
                cmd_uid: nanoid(),
                type: SceneExecutionCmdTypes.EXECUTION_SHORTCUT,
                shortcut: ExecutionShortcuts.EXECUTION_STEP
            })
        }
    }

    public request_stop() {
        if (this._client) {
            this._client.sendCommand({
                cmd_group: CommandGroups.EXECUTION,
                cmd_uid: nanoid(),
                type: SceneExecutionCmdTypes.EXECUTION_SHORTCUT,
                shortcut: ExecutionShortcuts.EXECUTION_PAUSE
            })
        }
    }
}