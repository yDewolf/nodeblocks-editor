import { NodeController } from "~/wrapper/controllers/node-controller";
import { ConnectionController } from "./connection-controller";
import { NodeTypeFile } from "~/wrapper/helpers/node-type-file";
import { ConnectionSceneData, NodeSceneData, NodeSceneFile, SceneData } from "~/wrapper/helpers/node-scene-file";

export class SceneController {
    node_type_reader: NodeTypeFile;
    node_scene_reader: NodeSceneFile;

    node_controller: NodeController;
    connection_controller: ConnectionController;
    
    constructor() {
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

    public gen_scene_data(): SceneData {
        const node_types_data = this.node_type_reader.raw_data;
        const node_types_id = this.node_type_reader.node_types_id;
        const node_types_version = this.node_type_reader.node_types_version;

        let scene_nodes: Map<string, NodeSceneData> = new Map();
        this.node_controller.nodes.forEach((node, idx) => {
            scene_nodes.set(`node_${node.id}`, {
                type: node.type_name,
                position: node.pos,
                size: node.rect.size,
                data: node.node_data.map_parameters()
            });
        });

        let scene_connections: Map<string, ConnectionSceneData> = new Map();
        this.connection_controller.connections.forEach((conn, id) => {
            const input_path: string = `nodes:node_${conn.input_slot.parent_node.id}:slots:${conn.input_slot.slot_name}`;
            const output_path: string = `nodes:node_${conn.output_slot.parent_node.id}:slots:${conn.output_slot.slot_name}`;
            scene_connections.set(`connection_${id}`, {
                from: output_path,
                to: input_path
            });
        });

        const scene_data: SceneData = {
            node_types_id: node_types_id != null ? node_types_id : "unknown",
            node_types_version: node_types_version,
            nodes: scene_nodes,
            connections: scene_connections
        }

        return scene_data;
    }

    public save_scene(): SceneData {
        const scene_data = this.gen_scene_data()
        this.node_scene_reader.save_data_to_file(scene_data);
        return scene_data;
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

    protected _clear_scene() {
        this.node_controller.clear();
        this.connection_controller.clear();
    }

    // 
    protected _parse_loaded_node_scene() {
        if (this.node_scene_reader.scene_data == null) {
            return;
        }

        this.node_scene_reader.scene_data.nodes.forEach((node_data: NodeSceneData, node_key: string) => {
            const constructor = this.node_type_reader.get_constructor(node_data.type);
            const splitted_name = node_key.split("_");
            if (splitted_name.length < 2) {
                return;
            }

            const node_id = splitted_name[1];
            if (constructor) {
                const node = constructor.make_node(
                    constructor.type_name, //+ "_" + node_id.toString(),
                    node_data.position,
                    node_id,
                    node_data.data,
                )
                this.node_controller.add_node(node);
            }
        });

        this.node_scene_reader.scene_data.connections.forEach((conn_data: ConnectionSceneData) => {
            const node_a_path = NodeSceneFile.parse_node_path(conn_data.from);
            const node_b_path = NodeSceneFile.parse_node_path(conn_data.to);
            if (node_a_path.slot_name == undefined || node_b_path.slot_name == undefined) {
                console.error("Couldn't find node slots. Paths:", node_a_path, node_b_path);
                return;
            }

            const node_a = this.node_controller.get_node(node_a_path.node_id);
            const node_b = this.node_controller.get_node(node_b_path.node_id);
            if (!node_a || !node_b) {
                console.error("Couldn't find node slots. Paths:", node_a_path, node_b_path);
                return;
            }

            const slot_a = node_a.get_slot(node_a_path.slot_name);
            const slot_b = node_b.get_slot(node_b_path.slot_name);
            if (slot_a == undefined || slot_b == undefined) {
                console.error("Couldn't find node slots. Paths:", node_a_path, node_b_path);
                return;
            }

            this.connection_controller.connect_node_to(
                slot_a, slot_b
            );
        });
    }

    protected _load_node_types(file_path: string) {
        this.node_type_reader._load_file_async(file_path).then(
            () => {
                this.node_controller.load_node_types(this.node_type_reader);
                console.log("loaded file", this.node_type_reader.node_constructors)
            }
        );
    }
    
    public load_node_type_data(type_data: any) {
        this.node_type_reader.load_type_data(type_data);
        this.node_controller.load_node_types(this.node_type_reader);
    }

    public load_scene_data(scene_data: any) {
        this.node_scene_reader.load_from_json_data(scene_data);
        
        this.node_scene_reader.swap_virtual_data();
        this._clear_scene();
        this._parse_loaded_node_scene();
    }
}