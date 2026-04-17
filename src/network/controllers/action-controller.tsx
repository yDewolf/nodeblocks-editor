import { SceneController } from "~/wrapper/controllers/scene-controller";
import { NodeServerClient } from "../websocket/websocket-handler";
import { ClientMessages, EditorActionStatus, SceneActionTypes } from "../websocket/websocket-protocol";
import { GraphNode } from "~/wrapper/nodes/graph-node";
import { ClientAction, ClientCommand, ConnectionActionPayload, NodeActionPayload } from '../websocket/request-types';
import { MinimalNodeSceneData } from "~/wrapper/helpers/node-scene-file";
import { nanoid } from "nanoid";
import { createSignal } from "solid-js";

export type PayloadTypes = NodeActionPayload | ConnectionActionPayload;
export class Action<PayloadType extends PayloadTypes> {
    private _request: ClientAction;
    private _status: () => EditorActionStatus;
    private _set_status: (new_status: EditorActionStatus) => void;

    constructor(
        request: ClientAction, 
        private _unsynced_apply: (action: Action<PayloadType>) => void, 
        private _unsynced_revert: (action: Action<PayloadType>) => void,
        private _finish_sync: (action: Action<PayloadType>) => void
    ) {
        const [status, setStatus] = createSignal(EditorActionStatus.UNSYNCED);
        this._status = status;
        this._set_status = setStatus;
        this._request = request
    }
    
    // Applies client only stuff
    public unsynced_apply() {
        this._unsynced_apply(this);
    }

    // Syncs with server's result
    private finish_sync() {
        this._finish_sync(this);
    }

    public unsynced_revert() {
        this._unsynced_revert(this);
    }

    private revert() {
        this._unsynced_revert(this);
    }

    public update_action_status(new_status: EditorActionStatus) {
        this._set_status(new_status);
        this.finish_sync();
    }

    get status() {return this._status(); }

    get uid() {return this._request.action_uid}
    get request() {return this._request}

    public static make_action_id(action_type: SceneActionTypes): string {
        return action_type + "_" + nanoid(6);
    }
}

export class ActionController {
    _client: NodeServerClient;
    _scene_controller: SceneController

    private MAX_ACTION_HISTORY: number = 10;
    private action_history: Array<Action<any>> = new Array(); 

    private unsynced_actions: Array<Action<any>> = new Array();

    constructor(client: NodeServerClient, scene_controller: SceneController) {
        this._client = client
        this._scene_controller = scene_controller
    }

    public request_add_nodes(nodes: GraphNode[]) {
        let action_data: {[uid: string]: MinimalNodeSceneData} = {};
        nodes.forEach((node) => {
            action_data[node.id] = {
                type: node.type_name, 
                data: Object.fromEntries(node.node_data.map_parameters()), 
                position: node.pos
            };
        })

        const action: Action<NodeActionPayload> = new Action({
            action_uid: Action.make_action_id(SceneActionTypes.ADD),
            type: ClientMessages.NODE_ACTION,
            payload: {action: SceneActionTypes.ADD, 
                action_data: action_data
            }
        }, this._unsynced_node_add, this._unsynced_node_remove, this._sync_node);
        this.unsynced_actions.push(action);
        action.unsynced_apply();
    }

    public request_remove_nodes(nodes: GraphNode[]) {
        let uids = new Array<string>();
        nodes.forEach((node) => {
            uids.push(node.id);
        })

        const action: Action<NodeActionPayload> = new Action({
            action_uid: Action.make_action_id(SceneActionTypes.REMOVE),
            type: ClientMessages.NODE_ACTION,
            payload: {action: SceneActionTypes.REMOVE, 
                uids: uids, 
            }
        }, this._unsynced_node_remove, this._unsynced_node_add, this._sync_node);
        this.unsynced_actions.push(action);
        
        // Parse Action:
        nodes.forEach((node) => {
            // FIXME: Queue desconnect and free
            node.get_connections().forEach((conn) => {
                this._scene_controller.connection_controller.disconnect_nodes(conn);
            });
            this._scene_controller.node_controller.remove_node(node);
        });
    }
    
    // Called when client receives server's SYNC_ACTION packet
    public sync_actions(action_statuses: { [uid: string]: EditorActionStatus; }) {
        Object.entries(action_statuses).forEach(([uid, status]) => {
            const unsynced_action = this.unsynced_actions.filter((action) => action.uid == uid).at(0);
            if (unsynced_action) {
                unsynced_action.update_action_status(status);
            }
        })
    }

    protected _sync_node(action: Action<NodeActionPayload>): void {
        switch (action.request.payload.action) {
            case SceneActionTypes.ADD:
                // TODO: Finish adding node
                break;

            case SceneActionTypes.REMOVE:
                // TODO: Finish removing node
                break;
        }
    }

    protected _unsynced_node_add(action: Action<NodeActionPayload>) {
        if (action.request.payload.action != SceneActionTypes.ADD) return

        const nodes_data = action.request.payload.action_data;
        Object.entries(nodes_data).forEach(([uid, node_data]) => {
            this._scene_controller.node_controller.add_new_node(
                "", node_data.position, node_data.type,
                uid 
            );
        });
    }

    protected _unsynced_node_remove(action: Action<NodeActionPayload>) {

    }

    
}