import { createSignal } from "solid-js";
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

export interface NodePathData {
    node_id: number,
    slot_name?: string
}

export class NodeSceneFile {
    _virtual_file: NodeSceneFile | undefined = undefined;

    file_path: string | null = null;
    raw_data: Object | null = null;

    scene_data: SceneData | null = null;

    private _version: () => number;
    private _set_version: (value: number) => undefined

    constructor(is_virtual: boolean = false) {
        if (!is_virtual) {
            this._virtual_file = new NodeSceneFile(true);
        }

        const [changedState, setChangedState] = createSignal(0);
        this._version = changedState;
        this._set_version = setChangedState;
    }

    public keep_track() { this._version() }
    protected notify() {
        this._set_version(this._version() + 1)
    }

    public is_virtual_data_compatible(): boolean {
        if (this.scene_data == null) {
            return true;
        }

        if (this._virtual_file == undefined) {
            return false;
        }

        if (this._virtual_file.scene_data == null) {
            return false;
        }

        const virtual_data = this._virtual_file.scene_data;
        if (virtual_data.node_types_id != this.scene_data?.node_types_id) {
            return false;
        }

        if (virtual_data.node_types_version != this.scene_data.node_types_version) {
            return false;
        }

        return true;
    }

    public swap_virtual_data() {
        if (this._virtual_file == undefined) {
            return;
        }
        if (this._virtual_file.scene_data == null) {
            return;
        }

        this.scene_data = this._virtual_file.scene_data;
        this.raw_data = this._virtual_file.raw_data;
        this.file_path = this._virtual_file.file_path;

        this._virtual_file.file_path = null;
        this._virtual_file.raw_data = null;
        this._virtual_file.scene_data = null;
        this.notify();
    }

    public async _load_file_path_async(file_path: string) {
        this.file_path = file_path;

        try {
            const response = await fetch(file_path);
            const json_data = await response.json();

            this.raw_data = json_data;
            const data = NodeSceneFile.json_to_scene_data(json_data)
            if (this._virtual_file) {
                this._virtual_file.scene_data = data;
                return;
            }
            this.scene_data = data;
        } catch {

        }
    }

    public async _load_file_async(file: File) {
        try {
            const json_data = JSON.parse(await file.text());

            this.raw_data = json_data;
            const data = NodeSceneFile.json_to_scene_data(json_data)
            if (this._virtual_file) {
                this._virtual_file.scene_data = data;
                return;
            }
            this.scene_data = data;
        } catch {

        }
    }

    static scene_data_to_json(scene: SceneData): string {
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
    
    static json_to_scene_data(json_data: any): SceneData {
        const scene: SceneData = {
            node_types_id: json_data.node_types_id,
            node_types_version: json_data.node_types_version,
            nodes: new Map(Object.entries(json_data.nodes).map(([id, data]: [string, any]) => {
                return [id, {
                    ...data,
                    position: { x: data.position[0], y: data.position[1] },
                    size: { x: data.size[0], y: data.size[1] },
                    data: new Map(Object.entries(data.data))
                }];
            })),
            connections: new Map(Object.entries(json_data.connections).map(([id, data]: [string, any]) => {
                return [id, {
                    ...data,
                    from: data.from,
                    to: data.to
                }];
            })),
        };
        
        return scene;
    }

    static parse_node_path(path: string): NodePathData {
        const regex = new RegExp("nodes:node_(\\d+):slots:([^:\\s]+)", "i");
        const match = regex.exec(path);
        if (match) {
            return {
                node_id: Number.parseInt(match[1]),
                slot_name: match.length > 1 ? match[2] : undefined
            }
        }

        return {
            node_id: -1
        }
    }
}