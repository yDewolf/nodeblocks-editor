import { SceneController } from "~/wrapper/controllers/scene-controller";
import { NodeServerClient } from "../websocket/websocket-handler";
import { ClientMessages, EditorActionStatus, SceneActionTypes } from "../websocket/websocket-protocol";
import { GraphNode } from "~/wrapper/nodes/graph-node";
import { ClientAction, ClientCommand } from '../websocket/request-types';
import { MinimalNodeSceneData } from "~/wrapper/helpers/node-scene-file";
import { nanoid } from "nanoid";

export class Action {
    private _request: ClientAction;
    private _status: EditorActionStatus = EditorActionStatus.UNSYNCED;

    constructor(request: ClientAction, private apply_func: (action: Action, partial: boolean) => void, private undo_func: (action: Action, partial: boolean) => void) {
        this._request = request
    }

    public partially_apply() {
        this.apply_func(this, true);
    }

    private apply() {
        this.apply_func(this, false);
    }

    public partially_undo() {
        this.undo_func(this, true);
    }

    private undo() {
        this.undo_func(this, false);
    }

    public update_action_status(new_status: EditorActionStatus) {
        this._status = new_status;
        if (this._status == EditorActionStatus.SUCCESSFULL) {
            this.apply();
        }
    }

    get status() {return this._status; }

    get uid() {return this._request.action_uid}
    get request() {return this._request}
}

export class ActionController {
    _client: NodeServerClient;
    _scene_controller: SceneController

    private MAX_ACTION_HISTORY: number = 10;
    private action_history: Array<Action> = new Array(); 

    private unsynced_actions: Array<Action> = new Array();

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

        const action: Action = new Action({
            action_uid: this.make_action_id(SceneActionTypes.ADD),
            type: ClientMessages.NODE_ACTION,
            payload: {action: SceneActionTypes.ADD, 
                action_data: action_data
            }
        }, this._parse_node_add, this._parse_node_remove);
        this.unsynced_actions.push(action);
        action.partially_apply();
    }

    public request_remove_nodes(nodes: GraphNode[]) {
        let uids = new Array<string>();
        nodes.forEach((node) => {
            uids.push(node.id);
        })

        const action: Action = new Action({
            action_uid: this.make_action_id(SceneActionTypes.REMOVE),
            type: ClientMessages.NODE_ACTION,
            payload: {action: SceneActionTypes.REMOVE, 
                uids: uids, 
            }
        }, this._parse_node_remove, this._parse_node_add);
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
    
    public sync_actions(uids: string[], status: EditorActionStatus[]) {
        this.unsynced_actions.filter((action) => uids.includes(action.uid)).forEach((unsynced_action) => {
            // FIXME: Handle Status update

        });
    }

    protected _parse_node_add(action: Action, partial: boolean) {
        if (action.request.type != ClientMessages.NODE_ACTION) return
        if (action.request.payload.action != SceneActionTypes.ADD) return
        const nodes_data = action.request.payload.action_data;
        Object.entries(nodes_data).forEach(([uid, node_data]) => {
            this._scene_controller.node_controller.add_new_node(
                "", node_data.position, node_data.type,
                uid 
            );
        });
    }

    protected _parse_node_remove(action: Action, partial: boolean) {

    }

    private make_action_id(action_type: SceneActionTypes): string {
        return action_type + "_" + nanoid(6);
    }
}