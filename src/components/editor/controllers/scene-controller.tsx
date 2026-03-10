import { NodeController } from "~/components/nodes/node-controller";
import { ConnectionController } from "./connection-controller";
import { Vector2 } from "~/data_types/geometry";
import { NodeTypeFile } from "~/helpers/node-type-file";
import { ConnectionSceneData, NodeSceneData, SceneData } from "~/helpers/node-scene-file";





export class SceneController {
    node_type_reader: NodeTypeFile;

    node_controller: NodeController;
    connection_controller: ConnectionController;
    
    constructor() {
        this.node_type_reader = new NodeTypeFile();
        this.node_controller = new NodeController()
        this.connection_controller = new ConnectionController();
    }
    
    public load_scene(scene_path: string, node_types_path: string) {
        this._load_node_types(node_types_path);
        this._load_node_scene(scene_path);
        this.node_controller.reset_id_count();
    }


    public save_scene(): SceneData {
        const node_types_data = this.node_type_reader.raw_data;
        const node_types_id = this.node_type_reader.node_types_id;
        const node_types_version = this.node_type_reader.node_types_version;

        let scene_nodes: Map<string, NodeSceneData> = new Map();
        this.node_controller.nodes.forEach((node, idx) => {
            scene_nodes.set(`node_${node.id}`, {
                type: node.type_name,
                position: node.pos,
                size: node.rect.size,
                data: node.node_data.parameters
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

    // TODO:
    protected _load_node_scene(file_path: string) {

    }

    protected _load_node_types(file_path: string) {
        this.node_type_reader.load_file(file_path).then(
            () => {
                this.node_controller.load_node_types(this.node_type_reader);
                console.log("loaded file", this.node_type_reader.node_constructors)
            }
        );
    }
}