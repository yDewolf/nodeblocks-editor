import { NodeServerClient } from "../websocket/websocket-handler";
import { SceneController } from "~/wrapper/controllers/scene-controller";
import { ClientMessages, ServerMessages } from "../websocket/websocket-protocol";
import { NodeSceneFile } from "~/wrapper/helpers/node-scene-file";

export class ServerSyncController {
    _client: NodeServerClient
    _scene_controller: SceneController

    constructor(client: NodeServerClient, scene_controller: SceneController) {
        this._client = client;
        this._scene_controller = scene_controller;
        this.setup_handlers();
    }

    protected setup_handlers() {
        this._client.add_handler(ServerMessages.SYNC_CLIENT_SCENE, (message) => {
            const scene_data = this._scene_controller.load_scene_data(message.payload);
        });
    }

    public sync_nodes() {

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


    public _on_node_added() {

    }

    public _on_node_removed() {

    }

    public _on_node_modified() {

    }
}