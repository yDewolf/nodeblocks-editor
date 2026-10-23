import { SceneConnectionManager } from "~/feature/editor/network/scene-connection-manager";
import { CanvasElementController } from "./canvas-element-controller";
import { StateController } from "~/feature/editor/controllers/state-controller";
import { JobStatus, NodeExecutionStatus } from "~/protocols/nodeblocks/engine/engine-status-protocols";
import { ServerEngineEventTypes } from "~/protocols/nodeblocks/network/server-message-protocol";
import { createStore, SetStoreFunction } from "solid-js/store";
import { batch } from "solid-js";

// TODO: get node execution order

interface SceneRuntimeContext {
    jobStatus: JobStatus,
    // node uid -> slot id -> output
    nodeOutputs: Record<string, Record<string, any>>,
    nodeStatuses: Record<string, NodeExecutionStatus>,
    targetedNodes?: string[]
    // This is plural since we might start processing multiple nodes at once
    latestProcessedNodes?: string[]
}

interface SceneRuntimeStore {
    contexts: Record<string, SceneRuntimeContext>,
    latestContext?: string
}

const MAX_RUNTIME_CONTEXTS = 3;

export class SceneRuntimeController {
    private _stateController: StateController;
    private _runtimeStore: SceneRuntimeStore;
    private _setRuntimeStore: SetStoreFunction<SceneRuntimeStore>;

    constructor(
        private readonly sceneConnection: SceneConnectionManager,
        private readonly elementController: CanvasElementController
    ) {
        this._stateController = new StateController(this.sceneConnection);
        [this._runtimeStore, this._setRuntimeStore] = createStore<SceneRuntimeStore>({
            contexts: {},
            latestContext: undefined
        })

        this.setupHandlers();
    }

    get stateController() { return this._stateController; }

    protected setupHandlers() {
        this.sceneConnection.onEngineEvent(ServerEngineEventTypes.JOB_STATUS, (msg) => {
            if (!(msg.event_payload.job_id in this._runtimeStore.contexts)) {
                
                // FIXME: isso aqui deveria ser uma informação que a gente recebe do server
                let nodeStatuses: Record<string, NodeExecutionStatus> = {}
                let nodeOutputs: Record<string, Record<string, any>> = {}
                for (const node of Object.values(this.elementController.nodes)) {
                    nodeStatuses[node.uid] = NodeExecutionStatus.PENDING
                    nodeOutputs[node.uid] = {}
                    for (const slot of node.output_slots) {
                        nodeOutputs[node.uid][slot.slot_id] = undefined;
                    }
                }

                batch(() => {
                    this._setRuntimeStore("contexts", msg.event_payload.job_id, {
                        jobStatus: msg.event_payload.status,
                        nodeStatuses: nodeStatuses,
                        nodeOutputs: nodeOutputs,
                        targetedNodes: undefined, // TODO:
                        latestProcessedNodes: undefined
                    });
                    this._setRuntimeStore("latestContext", msg.event_payload.job_id);
    
                    const context_keys = Object.keys(this._runtimeStore.contexts);
                    const firstContext = context_keys[0];
                    if (context_keys.length > MAX_RUNTIME_CONTEXTS) {
                        this._setRuntimeStore("contexts", firstContext, undefined as any);
                    }
                });
                return;
            }
            this._setRuntimeStore(
                "contexts", msg.event_payload.job_id,
                "jobStatus", msg.event_payload.status
            );
        });

        this.sceneConnection.onEngineEvent(ServerEngineEventTypes.NODE_STATUS, (msg) => {
            if (!(msg.event_payload.job_id in this._runtimeStore.contexts)) {
                return;
            }
            batch(() => {
                this._setRuntimeStore(
                    "contexts", msg.event_payload.job_id, 
                    "nodeStatuses", msg.event_payload.node_uid,
                    msg.event_payload.status
                );
                this._setRuntimeStore(
                    "contexts", msg.event_payload.job_id,
                    "latestProcessedNodes", [msg.event_payload.node_uid]
                )
                if (msg.event_payload.node_result) {
                    this._setRuntimeStore(
                        "contexts", msg.event_payload.job_id, 
                        "nodeOutputs", msg.event_payload.node_uid,
                        msg.event_payload.node_result
                    );
                }
            });
        })
    }

    // Getters and Setters

    get contexts() { return this._runtimeStore.contexts; }
    
    get latestContextId() { return this._runtimeStore.latestContext; }

    get latestContext() { 
        if (!this._runtimeStore.latestContext) { return null; }
        return this._runtimeStore.contexts[this._runtimeStore.latestContext]
    }


    get nodeOutputs() { 
        if (!this._runtimeStore.latestContext) { return null; }
        return this._runtimeStore.contexts[this._runtimeStore.latestContext].nodeOutputs; 
    }

    get nodeStatuses() {
        if (!this._runtimeStore.latestContext) { return null; }
        return this._runtimeStore.contexts[this._runtimeStore.latestContext].nodeStatuses; 
    }

    public isNodeLatestProcessed = (node_uid: string) => {
        if (!this._runtimeStore.latestContext) { return false; }
        const context = this._runtimeStore.contexts[this._runtimeStore.latestContext];
        if (!context) return false;
        if (!context.latestProcessedNodes) return false;

        return context.latestProcessedNodes.includes(node_uid);
    }

    public getNodeStatus = (node_uid: string) => {
        if (!this._runtimeStore.latestContext) { return NodeExecutionStatus.PENDING; }
        const context = this._runtimeStore.contexts[this._runtimeStore.latestContext];
        return context?.nodeStatuses?.[node_uid] ?? NodeExecutionStatus.PENDING;
    }

    public getNodeOutputs = (node_uid: string) => {
        if (!this._runtimeStore.latestContext) { return null; }
        const context = this._runtimeStore.contexts[this._runtimeStore.latestContext];
        return context?.nodeOutputs?.[node_uid] ?? null;
    }

    public getNodeSlotOutput = (node_uid: string, slot_id: string) => {
        if (!this._runtimeStore.latestContext) { return null; }
        const context = this._runtimeStore.contexts[this._runtimeStore.latestContext];
        const nodeOuts = context?.nodeOutputs?.[node_uid];
        
        if (!nodeOuts) { return null; }
        return nodeOuts[slot_id] ?? null;
    }
}