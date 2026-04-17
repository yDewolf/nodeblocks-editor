import { NodeServerClient } from "../websocket/websocket-handler";
import { ClientMessages, EditorActionStatus, SceneActionTypes, ServerMessages } from "../websocket/websocket-protocol";
import { GraphNode } from "~/wrapper/nodes/graph-node";
import { ClientAction, ClientCommand, ConnectionActionPayload, NodeActionPayload } from '../websocket/request-types';
import { MinimalNodeSceneData } from "~/wrapper/helpers/node-scene-file";
import { nanoid } from "nanoid";
import { createSignal } from "solid-js";
import { NodeEditor } from "~/editor/node-editor";
import { SceneController } from "~/wrapper/controllers/scene-controller";
import { NodeConnection } from "~/wrapper/nodes/node-connection";

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
    private _editor: NodeEditor;

    private MAX_ACTION_HISTORY: number = 10;
    private action_history: Array<Action<any>> = new Array(); 

    private unsynced_actions: Array<Action<any>> = new Array();

    constructor(client: NodeServerClient, editor: NodeEditor) {
        this._client = client
        this._editor = editor;

        this._client.add_handler(ServerMessages.SYNC_ACTION, (message) => {
            this.sync_actions(message.action_statuses);
        });
    }

    // Called when client receives server's SYNC_ACTION packet
    protected sync_actions(action_statuses: { [uid: string]: EditorActionStatus; }) {
        Object.entries(action_statuses).forEach(([uid, status]) => {
            const unsynced_action = this.unsynced_actions.filter((action) => action.uid == uid).at(0);
            if (unsynced_action) {
                unsynced_action.update_action_status(status);
            }
        })
    }

    public request_add_nodes = (nodes: {[uid: string]: MinimalNodeSceneData;}) => {
        // let action_data: {[uid: string]: MinimalNodeSceneData} = {};
        // nodes.forEach((node) => {
        //     action_data[node.id] = {
        //         type: node.type_name, 
        //         data: Object.fromEntries(node.node_data.map_parameters()), 
        //         position: node.pos
        //     };
        // })
        const action: Action<NodeActionPayload> = new Action({
            action_uid: Action.make_action_id(SceneActionTypes.ADD),
            type: ClientMessages.NODE_ACTION,
            payload: {action: SceneActionTypes.ADD, 
                action_data: nodes
            }
        }, this._unsynced_node_add, this._unsynced_node_remove, this._sync_node);
        this.unsynced_actions.push(action);
        action.unsynced_apply();
    }

    public request_remove_nodes = (nodes: GraphNode[]) => {
        let uids = new Array<string>();
        nodes.forEach((node) => {
            uids.push(node.id);
        });
        
        const action: Action<NodeActionPayload> = new Action({
            action_uid: Action.make_action_id(SceneActionTypes.REMOVE),
            type: ClientMessages.NODE_ACTION,
            payload: {action: SceneActionTypes.REMOVE, 
                uids: uids, 
            }
        }, this._unsynced_node_remove, this._unsynced_node_add, this._sync_node);
        
        nodes.forEach((node) => {
            node.append_remove_action(action);
        });

        this.unsynced_actions.push(action);
        action.unsynced_apply();
    }
    
    protected _sync_node = (action: Action<NodeActionPayload>): void => {
        switch (action.request.payload.action) {
            case SceneActionTypes.ADD:
                // TODO: Finish adding node
                break;

            case SceneActionTypes.REMOVE:
                this._editor.scene_controller.node_controller.sync_free(action);
                // TODO: Finish removing node
                break;
        }
    }

    protected _unsynced_node_add = (action: Action<NodeActionPayload>) => {
        if (action.request.payload.action != SceneActionTypes.ADD) return
        if (action.request.type != ClientMessages.NODE_ACTION) return

        const nodes_data = action.request.payload.action_data;
        this._editor.scene_controller.add_nodes_unsynced(nodes_data);
        
        // TODO: Handle potential add errors
        if (!this._client.is_connected()) {
            action.update_action_status(
                EditorActionStatus.SUCCESSFULL
            );
        }
    }

    protected _unsynced_node_remove = (action: Action<NodeActionPayload>) => {
        if (action.request.payload.action != SceneActionTypes.REMOVE) return
        if (action.request.type != ClientMessages.NODE_ACTION) return

        let nodes: Array<GraphNode> = [];
        let connections: Array<NodeConnection> = [];
        action.request.payload.uids.forEach((uid) => {
            const node = this._editor.scene_controller.node_controller.get_node(uid);
            if (node) {
                nodes.push(node);
                node.get_connections().forEach((conn) => {
                    connections.push(conn);
                });
            }
        });
        this._editor.scene_controller.connection_controller.queue_disconnect(connections, action);
        this._editor.scene_controller.node_controller.queue_free_nodes(nodes, action);
        
        // TODO: Handle possible removal errors
        if (!this._client.is_connected()) {
            action.update_action_status(
                EditorActionStatus.SUCCESSFULL
            );
        }
    }
}