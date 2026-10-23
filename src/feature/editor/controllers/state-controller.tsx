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

    private _target_nodes: () => string[] | undefined;
    private _set_target_nodes: (state: string[] | undefined) => void;

    private _target_iterations: () => number | undefined;
    private _set_target_iterations: (state: number | undefined) => void;

    public constructor(
        private readonly _client: SceneConnectionManager
    ) {
        [this._runtime_state, this._set_runtime_state] = createSignal(SceneWorkerExecutionState.STOPPED);
        [this._runtime_mode, this._set_runtime_mode] = createSignal(SceneWorkerExecutionMode.GRAPH_STEP);
        [this._target_nodes, this._set_target_nodes] = createSignal<string[] | undefined>(undefined);
        [this._target_iterations, this._set_target_iterations] = createSignal<number | undefined>(undefined);
        this.setup_handlers();
    }

    private setup_handlers() {
        this._client.onCommandResponse(ServerCmdResponseTypes.EXECUTION_STATE_SYNC, (message) => {
            const runtime_state = message.response_payload.state as SceneWorkerExecutionState;
            const runtime_mode = message.response_payload.mode as SceneWorkerExecutionMode;
            
            if (this.runtime_state != runtime_state) this._set_runtime_state(runtime_state);
            if (this.runtime_mode != runtime_mode) this._set_runtime_mode(runtime_mode);
            
            this._set_target_iterations(message.response_payload.target_iterations);
            this._set_target_nodes(message.response_payload.target_nodes);
        });
    }

    get runtime_state() { return this._runtime_state();}
    get runtime_mode() { return this._runtime_mode(); }

    get target_nodes() { return this._target_nodes(); }
    get target_iterations() { return this._target_iterations(); }

    public isRunning = () => {
        return this.runtime_state == SceneWorkerExecutionState.RUNNING 
            || this.runtime_state == SceneWorkerExecutionState.RUNNING_CONTINUOUS

    }

    public requestExecutionConfigUpdate(
        state?: SceneWorkerExecutionState,
        target_iterations?: number,
        mode?: SceneWorkerExecutionMode,
        target_nodes?: string[],
    ) { 
        this._client.sendCommand({
            cmd_uid: nanoid(5),
            cmd_group: CommandGroups.EXECUTION,
            type: SceneExecutionCmdTypes.UPDATE_EXECUTION_CONFIG,
            state,
            mode,
            target_iterations,
            target_nodes
        })
    }

    public requestModeUpdate(new_mode: SceneWorkerExecutionMode) {
        this._client.sendCommand({
            cmd_group: CommandGroups.EXECUTION,
            cmd_uid: nanoid(),
            type: SceneExecutionCmdTypes.SET_EXECUTION_MODE,
            mode: new_mode
        });
    }

    public requestUpdateTargetNodes(nodes: string[]) {
        this._client.sendCommand({
            cmd_group: CommandGroups.EXECUTION,
            cmd_uid: nanoid(),
            type: SceneExecutionCmdTypes.UPDATE_TARGET_NODES,
            target_nodes: nodes
        })
    }

    public requestPlay() {
        if (this._client) {
            this._client.sendCommand({
                cmd_group: CommandGroups.EXECUTION,
                cmd_uid: nanoid(),
                type: SceneExecutionCmdTypes.SET_EXECUTION_STATE,
                state: SceneWorkerExecutionState.RUNNING,
            })
        }
    }

    public requestPlayContinuously(targetIterations?: number) {
        console.trace("test");
        if (this._client) [
            this._client.sendCommand({
                cmd_group: CommandGroups.EXECUTION,
                cmd_uid: nanoid(),
                type: SceneExecutionCmdTypes.SET_EXECUTION_STATE,
                state: SceneWorkerExecutionState.RUNNING_CONTINUOUS,
                target_iterations: targetIterations
            })
        ]
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


    public isNodeTargeted = (node_id: string) => {
        if (this.target_nodes) { 
            return this.target_nodes.includes(node_id);
        }
        return false;
    }


    public hasNodeTargets = () => {
        return (this.target_nodes ?? []).length > 0;
    }
}