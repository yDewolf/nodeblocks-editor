import { NodeActionPayload, NodeSceneRequestData } from "~/network/websocket/request-types";
import { SceneActionTypes, ClientMessages, EditorActionStatus } from "~/network/websocket/websocket-protocol";
import { GraphNode } from "~/wrapper/nodes/graph-node";
import { NodeConnection } from "~/wrapper/nodes/node-connection";
import { Action, ActionController } from "./action-controller";

export class NodeActionUtils {
    protected static _sync_node = (action: Action<NodeActionPayload>, action_controller: ActionController): void => {
        switch (action.request.payload.action) {
            case SceneActionTypes.ADD:
                // TODO: Finish adding node
                break;

            case SceneActionTypes.REMOVE:
                action_controller._editor.scene_controller.node_controller.sync_free(action);
                // TODO: Finish removing node
                break;
        }
    }

    public static request_add_nodes = (nodes: NodeSceneRequestData, action_controller: ActionController) => {
        const action: Action<NodeActionPayload> = new Action({
            action_uid: Action.make_action_id(SceneActionTypes.ADD),
            type: ClientMessages.NODE_ACTION,
            payload: {action: SceneActionTypes.ADD, 
                action_data: nodes
            }
        },  (action) => {this._unsynced_node_add(action, action_controller)}, 
            (action) => {this._unsynced_node_remove(action, action_controller)}, 
            (action) => {this._sync_node(action, action_controller)}
        );
        action_controller.add_new_action(action);
        action.unsynced_apply();
    }

    public static request_remove_nodes = (nodes: GraphNode[], action_controller: ActionController) => {
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
        },  (action) => this._unsynced_node_remove(action, action_controller), 
            (action) => this._unsynced_node_add(action, action_controller), 
            (action) => this._sync_node(action, action_controller)
        );
        
        nodes.forEach((node) => {
            node.append_remove_action(action);
            // FIXME: Am I supposed to send an action asking the server to delete the connections?
            node.get_connections().forEach((conn) => {
                action_controller._editor.scene_controller.connection_controller.disconnect_nodes(conn);
            });
        });

        action_controller.add_new_action(action);
        action.unsynced_apply();
    }


    protected static _unsynced_node_add = (action: Action<NodeActionPayload>, action_controller: ActionController) => {
        if (action.request.payload.action != SceneActionTypes.ADD) return
        if (action.request.type != ClientMessages.NODE_ACTION) return

        const nodes_data = action.request.payload.action_data;
        action_controller._editor.scene_controller.node_controller.add_nodes_unsynced(nodes_data);

        // TODO: Handle potential add errors
        if (!action_controller._client.is_connected()) {
            action.update_action_status(
                EditorActionStatus.SUCCESSFULL
            );
        }
    }

    protected static _unsynced_node_remove = (action: Action<NodeActionPayload>, action_controller: ActionController) => {
        if (action.request.payload.action != SceneActionTypes.REMOVE) return
        if (action.request.type != ClientMessages.NODE_ACTION) return

        let nodes: Array<GraphNode> = [];
        let connections: Array<NodeConnection> = [];
        action.request.payload.uids.forEach((uid) => {
            const node = action_controller._editor.scene_controller.node_controller.get_node(uid);
            if (node) {
                nodes.push(node);
                node.get_connections().forEach((conn) => {
                    connections.push(conn);
                });
            }
        });
        action_controller._editor.scene_controller.connection_controller.queue_disconnect(connections, action);
        action_controller._editor.scene_controller.node_controller.queue_free_nodes(nodes, action);
        
        // TODO: Handle possible removal errors
        if (!action_controller._client.is_connected()) {
            action.update_action_status(
                EditorActionStatus.SUCCESSFULL
            );
        }
    }
}