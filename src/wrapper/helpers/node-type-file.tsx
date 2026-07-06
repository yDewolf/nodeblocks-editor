import { BaseNodeConstructor, CustomNodeConstructor } from "./node-constructor";
import { NodeData } from "~/wrapper/nodes/data/node-data";
import { batch, createSignal } from "solid-js";
import { SceneData } from "./node-scene-file";
import { BaseDataType, DefaultDataTypes, DefaultRenderers, UNKNOWN_TYPE } from "../nodes/data/node-data-type";
import { BaseSlotType } from "../nodes/data/slot-types";
import { CustomDataType } from "../nodes/data/custom-data-types";

export interface TypeFile {
    format: number,
    version: number,
    id: string,
    data_types: Map<string, DataTypeData>,
    slot_types: Map<string, SlotTypeData>,
    node_types: Map<string, NodeTypesData>
}

interface DataTypeData {
    base?: DefaultDataTypes,
    default_renderer: DefaultRenderers,
    whitelist: Array<string>
}

interface SlotTypeData {
    data_type_id: string
}

export interface SlotData {
    type: string,
    max_connections: number,
    data_type: string | null,
    is_input: boolean,
    tooltip: string
}

// TODO: find a better way of adding parameter stuff
// maybe use Typescript type annotation like we use for requests
export interface NodeDataModel {
    type: string,
    default?: any,
    step?: number,
    range?: any,
    extension_filter?: string[],
    options?: Array<any>,
    option_type?: DefaultDataTypes
}

interface NodeTypesData {
    parameters: Map<string, NodeDataModel>
    slots: Map<string, SlotData>
}

export class NodeTypeFile {
    node_types_version: number = -1;
    file_path: string | null = null;
    raw_data: Object | null = null;
    node_types_id: string | null = null;
    
    data_types: Map<string, BaseDataType>;
    slot_types: Map<string, BaseSlotType>;
    node_constructors: Map<string, CustomNodeConstructor>;

    private _version: () => number;
    private _set_version: (value: number) => undefined

    constructor() {
        const [changedState, setChangedState] = createSignal(0);
        this._version = changedState;
        this._set_version = setChangedState;

        this.data_types = new Map();
        this.slot_types = new Map();
        this.node_constructors = new Map();
    }

    public is_scene_compatible(scene_data: SceneData): boolean {
        if (scene_data.types_id != this.node_types_id) {
            return false;
        }
        
        // TODO: Add better version compatibility (> x.x.x or (x.x.x[, etc)
        if (scene_data.types_version != this.node_types_version) {
            return false;
        }

        const has_missing_constructor = scene_data.nodes.values().some((node_data) => {
            if (!this.node_constructors.has(node_data.type)) {
                console.warn("WARNING: Currently loaded types can't construct type", node_data.type)
                return true;
            }
        })

        if (has_missing_constructor) {
            return false;
        }
        
        return true;
    }


    protected set_constructor(type_id: string, constructor: BaseNodeConstructor) {
        this.node_constructors.set(type_id, constructor);
    }

    public keep_track() { this._version() }
    protected notify() {
        this._set_version(this._version() + 1)
    }


    public get_constructor(type_id: string) {
        const constructor = this.node_constructors.get(type_id);
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
        const type_data = NodeTypeFile.json_to_type_file(json_data);
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
            
            const type_data = NodeTypeFile.json_to_type_file(json_data);
            this._parse_type_data(type_data);
        } catch {
            
        }
    }

    public async _parse_type_data(json_data: TypeFile) {
        this.raw_data = json_data;
        this.node_types_version = json_data.version;
        this.node_types_id = json_data.id;

        json_data.data_types.forEach((type_data, type_id) => {
            const custom_data_type = new CustomDataType(
                type_id,
                type_data.base,
                type_data.default_renderer,
                type_data.whitelist,
            )
            this.data_types.set(type_id, custom_data_type);
        });
        // Parse Slot Types
        json_data.slot_types.forEach((type_data, type_id) => {
            const custom_type = new BaseSlotType(
                this.data_types.get(type_data.data_type_id) || UNKNOWN_TYPE
            );
            this.slot_types.set(type_id, custom_type);
        });

        // Parse Node Types
        batch(() => {
            json_data.node_types.forEach((type_data, type_id) => {
                const node_data: NodeData = new NodeData(type_data.parameters);
                const custom_type_constructor = new CustomNodeConstructor(
                    type_id,
                    node_data,
                    type_data.slots,
                    this.slot_types
                );
                this.set_constructor(type_id, custom_type_constructor);
            });
            this.notify()
        })
    }

    static json_to_type_file(json_data: any): TypeFile {
        return {
            format: json_data.format,
            version: json_data.version ?? -1,
            id: json_data.id ?? "unknown",
            data_types: new Map(Object.entries(json_data.data_types || {}).map(([id, data]: [string, any]) => {
                return [id, {
                    base: data.base,
                    default_renderer: data.default_renderer,
                    whitelist: data.whitelist
                }];
            })),
            slot_types: new Map(Object.entries(json_data.slot_types || {}).map(([id, data]: [string, any]) => {
                return [id, {
                    data_type_id: data.data_type_id
                }];
            })),
            node_types: new Map(Object.entries(json_data.node_types || {}).map(([id, data]: [string, any]) => {
                return [id, {
                    metadata: data.metadata,
                    parameters: new Map(Object.entries(data.parameters || {}).map(([param_id, param_data]: [string, any]) => {
                        return [param_id, {
                            type: param_data.type,
                            default: param_data.default ?? null,
                            step: param_data.step ?? null,
                            range: param_data.range ?? null,
                            extension_filter: param_data.extension_filter ?? null,
                            options: param_data.options ?? null,
                            option_type: param_data.option_type ?? null,
                        }];
                    })),

                    slots: new Map(Object.entries(data.slots || {}).map(([slot_id, slot_data]: [string, any]) => {
                        return [slot_id, {
                            type: slot_data.type,
                            max_connections: slot_data.max_connections,
                            is_input: slot_data.is_input,
                            data_type: slot_data.data_type ?? null,
                            tooltip: slot_data.tooltip || ""
                        }];
                    }))
                }];
            }))
        };
    }
}