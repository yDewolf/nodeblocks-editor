import { Vector2 } from "~/protocols/nodeblocks/geometry";


export interface NodePathData {
    node_id: string;
}

export interface SlotPathData extends NodePathData {
    slot_id: string
}


export interface NodeSceneData {
    uid?: string;
    type_id: string; // TODO: Rename this to nodetype_fqn 
    position: Vector2;
    data: Map<string, any>;
}

export interface EditorNodeSceneData extends NodeSceneData {
    size?: Vector2;
}

export interface ConnectionSceneData {
    uid?: string;

    // Serialized paths
    from_slot: string;
    to_slot: string;
}


export interface SceneData {
    uid: string;
    dependencies: Record<string, string>;

    nodes: Record<string, EditorNodeSceneData>;
    connections: Record<string, ConnectionSceneData>;
}


export class NodePathUtils {
    static parse_node_path(path: string): SlotPathData | undefined {
        const regex = new RegExp("nodes:([a-z0-9-]+):slots:([^:\\s]+)", "i");
        const match = regex.exec(path);
        if (match && match.length == 2) {
            return {
                node_id: match[1],
                slot_id: match[2]
            }
        }

        return undefined
    }

    static make_slot_path(node_id: string, slot_id: string): string {
        return `nodes:${node_id}:slots:${slot_id}`
    }
}