import { NodeController } from "~/wrapper/controllers/node-controller";
import { ConnectionController } from "./connection-controller";
import { NodeTypeFile } from "~/wrapper/helpers/node-type-file";
import { ConnectionSceneData, NodeSceneData, NodeSceneFile, SceneData } from "~/wrapper/helpers/node-scene-file";
import { ActionController } from "~/network/controllers/actions/action-controller";
import { ConnSceneRequestData, NodeSceneRequestData } from "~/network/websocket/request-types";
import { NodeActionUtils } from "~/network/controllers/actions/node-actions";
import { ConnActionUtils } from "~/network/controllers/actions/conn-actions";

export class SceneController {
    node_type_reader: NodeTypeFile;
    node_scene_reader: NodeSceneFile;

    node_controller: NodeController;
    connection_controller: ConnectionController;

    do_clientside_request: boolean = false;

    constructor(private action_controller: ActionController) {
        this.node_type_reader = new NodeTypeFile();
        this.node_scene_reader = new NodeSceneFile();
        
        this.node_controller = new NodeController()
        this.connection_controller = new ConnectionController();
    }

    public safe_change_scene_file(new_file: File) {
        this.node_scene_reader._load_file_async(new_file).then(
            () => this.safe_load_scene_contents() 
        )
    }
    
    public load_scene(scene_path: string, node_types_path: string) {
        this._load_node_types(node_types_path);
        this._load_node_scene(scene_path);
    }
    
    public save_scene(): SceneData {
        const scene_data = SceneUtils.gen_scene_data(this)
        this.node_scene_reader.save_data_to_file(scene_data);
        return scene_data;
    }

    public _clear_scene() {
        this.node_controller.clear();
        this.connection_controller.clear();
        
    }

        public load_node_type_data(type_data: any) {
        this.node_type_reader.load_type_data(type_data);
        this.node_controller.load_node_types(this.node_type_reader);
    }

    public load_scene_data(scene_data: any) {
        if (scene_data && Object.entries(scene_data).length > 0) {
            this.node_scene_reader.load_from_json_data(scene_data);
            this.node_scene_reader.swap_virtual_data();
        }
        
        this._clear_scene();
        this._parse_loaded_node_scene();
    }


    protected _load_node_scene(file_path: string) {
        this.node_scene_reader._load_file_path_async(file_path).then(
            () => this.safe_load_scene_contents()
        );

    }

    protected safe_load_scene_contents() {
        if (!this.check_loading_scene()) {
            return;
        }

        this.node_scene_reader.swap_virtual_data();
        this._clear_scene();
        this._parse_loaded_node_scene();
    }

    protected check_loading_scene(): boolean {
        if (!this.node_scene_reader.is_virtual_data_compatible()) {
            console.error("Loaded scene is not compatbile with currently loaded scene");
            return false;
        }

        if (this.node_scene_reader._virtual_file?.scene_data) {
            if (!this.node_type_reader.is_scene_compatible(this.node_scene_reader._virtual_file.scene_data)) {
                console.error("Loaded scene is not compatbile with currently loaded types");
                return false;
            }
        }

        return true;
    }

    protected _load_node_types(file_path: string) {
        this.node_type_reader._load_file_async(file_path).then(
            () => {
                this.node_controller.load_node_types(this.node_type_reader);
            }
        );
    }

    protected _parse_loaded_node_scene() {
        if (this.node_scene_reader.scene_data == null) {
            return;
        }

        let nodes: NodeSceneRequestData = {};
        this.node_scene_reader.scene_data.nodes.forEach((node_data: NodeSceneData, node_key: string) => {
            const constructor = this.node_type_reader.get_constructor(node_data.type);
            if (constructor) {
                nodes[node_key] = {
                    type: constructor.type_id,
                    position: node_data.position,
                    data: node_data.data
                }
            }
        });
        NodeActionUtils.request_add_nodes(nodes, this.action_controller, this.do_clientside_request);

        let connections: ConnSceneRequestData = {};
        this.node_scene_reader.scene_data.connections.forEach((conn_data: ConnectionSceneData, conn_uid: string) => {
            connections[conn_uid] = conn_data;
        });
        ConnActionUtils.request_connect(connections, this.action_controller, this.do_clientside_request);
    }
}

export class SceneUtils {
    public static gen_scene_data(scene_controller: SceneController): SceneData {
        const node_types_data = scene_controller.node_type_reader.raw_data;
        const node_types_id = scene_controller.node_type_reader.node_types_id;
        const node_types_version = scene_controller.node_type_reader.node_types_version;

        let scene_nodes: Map<string, NodeSceneData> = new Map();
        scene_controller.node_controller.nodes.forEach((node, idx) => {
            scene_nodes.set(node.id, {
                type: node.type_id,
                position: node.pos,
                size: node.rect.size,
                data: node.node_data.map_parameters()
            });
        });

        let scene_connections: Map<string, ConnectionSceneData> = new Map();
        scene_controller.connection_controller.connections.forEach((conn, id) => {
            const input_path: string = NodeSceneFile.make_slot_path(conn.input_slot);
            const output_path: string = NodeSceneFile.make_slot_path(conn.output_slot);
            scene_connections.set(conn.uid, {
                from_slot: output_path,
                to_slot: input_path
            });
        });

        const scene_data: SceneData = {
            types_id: node_types_id != null ? node_types_id : "unknown",
            types_version: node_types_version,
            nodes: scene_nodes,
            connections: scene_connections
        }

        return scene_data;
    }
}