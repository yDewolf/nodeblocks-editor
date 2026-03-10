import { Vector2 } from "~/data_types/geometry";

export interface NodeSceneData {
    type: string,
    position: Vector2,
    size: Vector2,
    data: Map<string, any>
}

export interface ConnectionSceneData {
    from: string,
    to: string
}

export interface SceneData {
    node_types_id: string,
    node_types_version: number,
    nodes: Map<string, NodeSceneData>,
    connections: Map<string, ConnectionSceneData>
}


export function scene_data_to_json(scene: SceneData): string {
    return JSON.stringify(scene, (key, value) => {
        if (key.startsWith("_")) {
            return;
        }

        if (value instanceof Map) {
            return Object.fromEntries(value);
        }

        if (value && typeof value === 'object' && 'x' in value && 'y' in value) {
            return [value.x, value.y];
        }

        return value;
    }, 4);
}

export function json_to_scene_data(json: string): SceneData {
    const raw = JSON.parse(json);
    const scene: SceneData = {
        node_types_id: raw.node_types_id,
        node_types_version: raw.node_types_version,
        nodes: new Map(Object.entries(raw.nodes).map(([id, data]: [string, any]) => {
            return [id, {
                ...data,
                position: { x: data.position[0], y: data.position[1] },
                size: { x: data.size[0], y: data.size[1] },
                data: new Map(Object.entries(data.data))
            }];
        })),
        connections: new Map(Object.entries(raw.connections))
    };

    return scene;
}