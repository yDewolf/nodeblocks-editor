import { BaseNodeConstructor, CustomNodeConstructor } from "./node-constructor";
import { NodeData } from "~/wrapper/nodes/data/node-data";
import { batch, createSignal } from "solid-js";
import { SceneData } from "./node-scene-file";
import { BaseSlotType } from "../nodes/data/node-data-type";
import { CustomSlotType } from "../nodes/data/custom-data-types";

interface TypeFile {
    version: number,
    id: string,
    slot_types: Map<string, SlotTypeData>,
    node_types: Map<string, NodeTypesData>
}

interface SlotTypeData {
    extends: string,
    conn_whitelist: string[],
    default_data_type: string
}

export interface SlotData {
    type: string,
    data_type: string | null,
    tooltip: string
}

export interface NodeDataModel {
    type: string,
    range: any | null,
}

interface NodeTypesData {
    description: string,
    parameters: Map<string, NodeDataModel>
    slots: Map<string, SlotData>
}

export class NodeTypeFile {
    node_types_version: number = -1;
    file_path: string | null = null;
    raw_data: Object | null = null;
    node_types_id: string | null = null;
    
    slot_types: Map<string, BaseSlotType>;
    node_constructors: Map<string, CustomNodeConstructor>;

    private _version: () => number;
    private _set_version: (value: number) => undefined

    constructor() {
        const [changedState, setChangedState] = createSignal(0);
        this._version = changedState;
        this._set_version = setChangedState;

        this.slot_types = new Map();
        this.node_constructors = new Map();
    }

    public is_scene_compatible(scene_data: SceneData): boolean {
        if (scene_data.node_types_id != this.node_types_id) {
            return false;
        }

        // TODO: Add better version compatibility (> x.x.x or (x.x.x[, etc)
        if (scene_data.node_types_version != this.node_types_version) {
            return false;
        }

        const has_missing_constructor = scene_data.nodes.values().some((node_data) => {
            if (!this.node_constructors.has(node_data.type)) {
                return true;
            }
        })

        if (has_missing_constructor) {
            return false;
        }
        
        return true;
    }


    protected set_constructor(type_name: string, constructor: BaseNodeConstructor) {
        this.node_constructors.set(type_name, constructor);
    }

    public keep_track() { this._version() }
    protected notify() {
        this._set_version(this._version() + 1)
    }


    public get_constructor(type_name: string) {
        const constructor = this.node_constructors.get(type_name);
        if (constructor == undefined) {
            return null;
        }
        
        return constructor;
    }

    public load_file(file_path: string) {
        this._load_file_async(file_path).then(() => {
            this.notify();
            console.log("loaded file", this.node_constructors)
        });
    }

    public load_file_data(file: File) {
        this._load_file_data_async(file).then(() => {
            this.notify();
            console.log("loaded file", this.node_constructors)
        })
    }

    public load_type_data(type_data: any) {
        const parsed_data = NodeTypeFile.json_to_type_file(type_data)
        this._parse_type_data(parsed_data);
    }

    public async _load_file_data_async(file: File) {
        const json_data = JSON.parse(await file.text());
        this._parse_type_data(json_data);
    }

    public async _load_file_async(file_path: string) {
        this.file_path = file_path;
        try {
            const response = await fetch(file_path);
            const json_data = await response.json();
            if (!json_data) {
                return;
            }
            
            this._parse_type_data(json_data);
        } catch {

        }
    }

    public async _parse_type_data(json_data: TypeFile) {
        this.raw_data = json_data;
        this.node_types_version = json_data.version;
        this.node_types_id = json_data.id;
        
        // Parse Slot Types
        json_data.slot_types.forEach((type_data, type_name) => {
            const custom_type = new CustomSlotType(
                type_name,
                type_data.default_data_type,
                type_data.extends,
                type_data.conn_whitelist
            );
            this.slot_types.set(type_name, custom_type);
        });

        // Parse Node Types
        batch(() => {
            json_data.node_types.forEach((type_data, type_name) => {
                const node_data: NodeData = new NodeData(type_data.parameters);
                const custom_type_constructor = new CustomNodeConstructor(
                    type_name,
                    node_data,
                    type_data.slots,
                    this.slot_types
                );
                this.set_constructor(type_name, custom_type_constructor);
            });
            this.notify()
        })
    }

    static json_to_type_file(json_data: any): TypeFile {
        return {
            version: json_data.version ?? -1,
            id: json_data.id ?? "unknown",
            slot_types: new Map(Object.entries(json_data.slot_types || {}).map(([id, data]: [string, any]) => {
                return [id, {
                    extends: data.extends,
                    conn_whitelist: data.conn_whitelist || [],
                    default_data_type: data.default_data_type
                }];
            })),

            node_types: new Map(Object.entries(json_data.node_types || {}).map(([id, data]: [string, any]) => {
                return [id, {
                    description: data.description || "",
                    parameters: new Map(Object.entries(data.parameters || {}).map(([param_id, param_data]: [string, any]) => {
                        return [param_id, {
                            type: param_data.type,
                            range: param_data.range ?? null
                        }];
                    })),

                    slots: new Map(Object.entries(data.slots || {}).map(([slot_id, slot_data]: [string, any]) => {
                        return [slot_id, {
                            type: slot_data.type,
                            data_type: slot_data.data_type ?? null,
                            tooltip: slot_data.tooltip || ""
                        }];
                    }))
                }];
            }))
        };
    }
}