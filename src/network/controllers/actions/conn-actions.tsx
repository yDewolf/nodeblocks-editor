import { ConnectionActionPayload, ConnSceneRequestData, NodeActionPayload, NodeSceneRequestData } from "~/network/websocket/request-types";
import { SceneActionTypes, ClientMessages, EditorActionStatus } from "~/network/websocket/websocket-protocol";
import { GraphNode } from "~/wrapper/nodes/graph-node";
import { NodeConnection } from "~/wrapper/nodes/node-connection";
import { Action, ActionController } from "./action-controller";

export class ConnActionUtils {
    protected static _sync_action = (action: Action<ConnectionActionPayload>, action_controller: ActionController): void => {
        if (action.request.type != ClientMessages.CONNECTION_ACTION) return;
        switch (action.request.payload.action) {
            case SceneActionTypes.ADD:
                Object.entries(action.request.payload.action_data).forEach(([uid, conn_data]) => {
                    const conn = action_controller._editor.scene_controller.connection_controller.get_conn(uid);
                    if (conn) { 
                        conn._set_related_actions([...conn._related_actions()])
                    }
                });
                // TODO: Finish adding connection
                break;

            case SceneActionTypes.REMOVE:
                // TODO: Finish removing connection
                action.request.payload.uids.forEach((uid) => {
                    const conn = action_controller._editor.scene_controller.connection_controller.get_conn(uid);
                    if (conn) { 
                        conn._set_related_actions([...conn._related_actions()])
                    }
                });
                action_controller._editor.scene_controller.connection_controller.sync_disconnect(action);
                break;
        }
    }

    public static request_connect = (conns: ConnSceneRequestData, action_controller: ActionController, clientside: boolean = false) => {
        const action: Action<ConnectionActionPayload> = new Action(clientside, {
            action_uid: Action.make_action_id(SceneActionTypes.ADD),
            type: ClientMessages.CONNECTION_ACTION,
            payload: {
                action: SceneActionTypes.ADD,
                action_data: conns
            }
        },  
            (action) => {this._unsynced_connect(action, action_controller)}, 
            (action) => {this._unsynced_disconnect(action, action_controller)}, 
            (action) => {this._sync_action(action, action_controller)}
        );
        action_controller.add_new_action(action);
        action.unsynced_apply();
    }

    public static request_disconnect = (conns: NodeConnection[], action_controller: ActionController, clientside: boolean = false) => {
        let uids = new Array<string>();
        conns.forEach((conn) => { uids.push(conn.uid); });

        const action: Action<ConnectionActionPayload> = new Action(clientside, {
            action_uid: Action.make_action_id(SceneActionTypes.REMOVE),
            type: ClientMessages.CONNECTION_ACTION,
            payload: {
                action: SceneActionTypes.REMOVE,
                uids: uids
            }
        },  
            (action) => {this._unsynced_disconnect(action, action_controller)}, 
            (action) => {this._unsynced_connect(action, action_controller)}, 
            (action) => {this._sync_action(action, action_controller)}
        );

        conns.forEach((conn) => {
            conn.append_remove_action(action);
        });
        action_controller.add_new_action(action);
        action.unsynced_apply();
    }


    protected static _unsynced_connect = (action: Action<ConnectionActionPayload>, action_controller: ActionController) => {
        if (action.request.payload.action != SceneActionTypes.ADD) return
        if (action.request.type != ClientMessages.CONNECTION_ACTION) return

        const conns_data = action.request.payload.action_data;
        const connections = action_controller._editor.scene_controller.connection_controller.unsynced_connect(
            conns_data, action_controller._editor.scene_controller.node_controller
        );
        connections.forEach((conn) => {
            conn.append_add_action(action);
        });
        
        // TODO: Handle potential add errors
        if (!action_controller._client.is_connected() || action.is_clientside) {
            action.update_action_status(
                EditorActionStatus.SUCCESSFULL
            );
        }
    }

    protected static _unsynced_disconnect = (action: Action<ConnectionActionPayload>, action_controller: ActionController) => {
        if (action.request.payload.action != SceneActionTypes.REMOVE) return
        if (action.request.type != ClientMessages.CONNECTION_ACTION) return

        let connections: Array<NodeConnection> = [];
        action.request.payload.uids.forEach((uid) => {
            const conn = action_controller._editor.scene_controller.connection_controller.get_conn(uid);
            if (conn) {
                connections.push(conn);
            }
        });
        action_controller._editor.scene_controller.connection_controller.queue_disconnect(connections, action);

        // TODO: Handle possible removal errors
        if (!action_controller._client.is_connected() || action.is_clientside) {
            action.update_action_status(
                EditorActionStatus.SUCCESSFULL
            );
        }
    }
}