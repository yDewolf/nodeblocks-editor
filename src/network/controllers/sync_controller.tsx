import { NodeServerClient } from "../websocket/websocket-handler";
import { SceneController } from "~/wrapper/controllers/scene-controller";
import { ClientMessages, ServerMessages } from "../websocket/websocket-protocol";
import { NodeSceneFile } from "~/wrapper/helpers/node-scene-file";
import { createEffect, createRoot, on } from "solid-js";
import { GraphNode } from "~/wrapper/nodes/graph-node";

export class ServerSyncController {
    _client: NodeServerClient
    _scene_controller: SceneController
    private _last_node_ids: Set<string> = new Set();
    private _node_disposers: Map<string, () => void> = new Map();

    constructor(client: NodeServerClient, scene_controller: SceneController) {
        this._client = client;
        this._scene_controller = scene_controller;
        this.setup_handlers();
        this.observe_nodes();
    }

    protected setup_handlers() {
        this._client.add_handler(ServerMessages.SYNC_CLIENT_SCENE, (message) => {
            const scene_data = this._scene_controller.load_scene_data(message.payload);
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

    public send_local_scene() {
        this._client.sendCommand({
            type: ClientMessages.LOAD_SCENE, 
            payload: NodeSceneFile.scene_data_to_json(this._scene_controller.gen_scene_data())
        });
    }

    public sync_with_server_scene() {
        this._client.sendCommand({type: ClientMessages.SYNC_CLIENT_SCENE})
    }


    public _on_node_added(node: GraphNode) {
        createRoot((dispose) => {
            this._node_disposers.set(node.id, dispose)
            createEffect(on(() => {
                return Array.from(node.node_data.parameters.values()).map(param => param.value);
            }, (parameters) => {
                this._on_node_modified(node);
                
            }, { defer: true }));
        });

        console.log("Node Added", node);
    }

    public _on_node_removed(node_id: string) {
        const dispose = this._node_disposers.get(node_id);
        if (dispose) {dispose()}

        console.log("Node removed", node_id);
        // 
    }   

    public _on_node_modified(node: GraphNode) {
        console.log("Node modified", node);
    }
}