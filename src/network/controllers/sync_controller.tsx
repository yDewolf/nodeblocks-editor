import { NodeServerClient } from "../websocket/websocket-handler";
import { SceneController } from "~/wrapper/controllers/scene-controller";
import { ClientMessages, SceneActionTypes, ServerMessages } from "../websocket/websocket-protocol";
import { NodeSceneFile } from "~/wrapper/helpers/node-scene-file";
import { createEffect, createRoot, on } from "solid-js";
import { GraphNode } from "~/wrapper/nodes/graph-node";
import { MinimalNodeSceneData, ConnectionSceneData } from '../../wrapper/helpers/node-scene-file';
import { NodeConnection } from "~/wrapper/nodes/node-connection";

export class ServerSyncController {
    _client: NodeServerClient
    _scene_controller: SceneController
    private _last_node_ids: Set<string> = new Set();
    private _last_conn_ids: Set<string> = new Set();
    private _node_disposers: Map<string, () => void> = new Map();
    private _conn_disposers: Map<string, () => void> = new Map();

    private syncing_scene: boolean = false;

    constructor(client: NodeServerClient, scene_controller: SceneController) {
        this._client = client;
        this._scene_controller = scene_controller;
        this.setup_handlers();
        this.observe_nodes();
        this.observe_connections();
    }

    protected setup_handlers() {
        this._client.add_handler(ServerMessages.SYNC_CLIENT_SCENE, (message) => {
            const scene_data = this._scene_controller.load_scene_data(message.payload);
            this.syncing_scene = false;
        });
    }

    private observe_nodes() {
        createRoot(() => {
            createEffect(() => {
                const current_nodes = this._scene_controller.node_controller.nodes;
                let current_ids: string[] = [];
                current_nodes.forEach((node) => {current_ids.push(node.id)})

                for (const node of current_nodes) {
                    if (!this._last_node_ids.has(node.id)) {
                        this._on_node_added(node!);
                    }
                }

                for (const id of this._last_node_ids) {
                    if (!this._scene_controller.node_controller.get_node(id)) {
                        this._on_node_removed(id);
                    }
                }

                this._last_node_ids = new Set(current_ids);
            });
        });
    }

    private observe_connections() {
        createRoot(() => {
            createEffect(() => {
                const current_connections = this._scene_controller.connection_controller.connections;
                let current_ids: string[] = [];
                current_connections.forEach((conn) => {current_ids.push(conn.uid)})

                for (const conn of current_connections) {
                    if (!this._last_conn_ids.has(conn.uid)) {
                        this._on_conn_added(conn!);
                    }
                }

                for (const id of this._last_conn_ids) {
                    if (!this._scene_controller.connection_controller.get_conn(id)) {
                        this._on_conn_removed(id);

                    }
                }

                this._last_conn_ids = new Set(current_ids);
            });
        });
    }

    public send_local_scene() {
        this._client.sendCommand({
            type: ClientMessages.LOAD_SCENE, 
            payload: NodeSceneFile.scene_data_to_json(this._scene_controller.gen_scene_data())
        });
    }

    public sync_with_server_scene() {
        this._client.sendCommand({type: ClientMessages.SYNC_CLIENT_SCENE})
        this.syncing_scene = true;
    }


    public _on_node_added(node: GraphNode) {
        if (this.syncing_scene) { return; }

        createRoot((dispose) => {
            this._node_disposers.set(node.id, dispose)
            createEffect(on(() => {
                return Array.from(node.node_data.parameters.values()).map(param => param.value);
            }, (parameters) => {
                this._on_node_updated(node);
                
            }, { defer: true }));
        });

        this._client.sendCommand({
            type: ClientMessages.NODE_ACTION,
            payload: {action: SceneActionTypes.ADD, uid: node.id,
                action_data: {type: node.type_name, data: Object.fromEntries(node.node_data.map_parameters()), position: node.pos}
            }
        });
        // console.log("Node Added", node);
    }

    public _on_node_removed(node_id: string) {
        if (this.syncing_scene) { return; }

        const dispose = this._node_disposers.get(node_id);
        if (dispose) {dispose()}
        
        this._client.sendCommand({
            type: ClientMessages.NODE_ACTION,
            payload: {action: SceneActionTypes.REMOVE, uid: node_id}
        });
        // console.log("Node removed", node_id);
        // 
    }   

    public _on_node_updated(node: GraphNode) {
        if (this.syncing_scene) { return; }

        this._client.sendCommand({
            type: ClientMessages.NODE_ACTION,
            payload: {action: SceneActionTypes.UPDATE, uid: node.id,
                action_data: {type: node.type_name, data: Object.fromEntries(node.node_data.map_parameters()), position: node.pos}
            }
        });
        // console.log("Node modified", node);
    }


    public _on_conn_added(conn: NodeConnection) {
        if (this.syncing_scene) { return; }

        createRoot((dispose) => {
            this._conn_disposers.set(conn.uid, dispose)
            createEffect(on(() => {
                conn.slot_a
                conn.slot_b
            }, () => {
                this._on_conn_updated(conn);
                
            }, { defer: true }));
        });

        this._client.sendCommand({
            type: ClientMessages.CONNECTION_ACTION,
            payload: {action: SceneActionTypes.ADD, uid: conn.uid,
                action_data: {
                    from: NodeSceneFile.make_slot_path(conn.input_slot), 
                    to: NodeSceneFile.make_slot_path(conn.output_slot)
                }
            }
        });
        // console.log("Node Added", node);
    }

    public _on_conn_removed(conn_uid: string) {
        if (this.syncing_scene) { return; }

        const dispose = this._conn_disposers.get(conn_uid);
        if (dispose) {dispose()}

        console.log(conn_uid, console.trace())
        this._client.sendCommand({
            type: ClientMessages.CONNECTION_ACTION,
            payload: {action: SceneActionTypes.REMOVE, uid: conn_uid}
        });
        // console.log("Node removed", node_id);
        // 
    }   

    // TODO: Implement connection updating in the UI
    // (clicking a connected slot should select the connection or something like that)
    public _on_conn_updated(conn: NodeConnection) {
        if (this.syncing_scene) { return; }

        this._client.sendCommand({
            type: ClientMessages.CONNECTION_ACTION,
            payload: {action: SceneActionTypes.UPDATE, uid: conn.uid,
                action_data: {
                    from: NodeSceneFile.make_slot_path(conn.input_slot), 
                    to: NodeSceneFile.make_slot_path(conn.output_slot)
                }
            }
        });
        // console.log("Node modified", node);
    }
}