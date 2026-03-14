import { CustomSlotType } from "~/components/nodes/slot/slot-type";
import { BaseNodeConstructor, CustomNodeConstructor } from "./node-constructor";
import { NodeData } from "~/components/nodes/data/node-data";
import { batch, createSignal } from "solid-js";
import { NodeSceneData, SceneData } from "./node-scene-file";

// TODO: Refactor all of this code to match with NodeSceneFile Standards

async function load_json_file(path: string) {
    try {
        const response = await fetch(path);
        const data = parse_json_as_type_file(await response.json());

        return data;

    } catch (e) {
        console.error("Erro ao ler o arquivo local:", e);
    }

    return null;
}

function parse_json_as_type_file(data: TypeFile) {
    data.slot_types = new Map<string, SlotTypeData>(Object.entries(data.slot_types));
    data.node_types = new Map<string, NodeTypesData>(Object.entries(data.node_types));
    data.node_types.forEach(type_data => {
        type_data.slots = new Map<string, SlotData>(Object.entries(type_data.slots))
        type_data.parameters = new Map<string, NodeParameterData>(Object.entries(type_data.parameters))
    });

    return data;
}

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

export interface NodeParameterData {
    type: string,
    range: any | null,
}

interface NodeTypesData {
    description: string,
    parameters: Map<string, NodeParameterData>
    slots: Map<string, SlotData>
}

export class NodeTypeFile {
    node_types_version: number = -1;
    file_path: string | null = null;
    raw_data: Object | null = null;
    node_types_id: string | null = null;
    
    slot_types: Map<string, CustomSlotType>;
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

    public async _load_file_data_async(file: File) {
        const json_data = JSON.parse(await file.text());
        this._parse_file_data(json_data);
    }

    public async _load_file_async(file_path: string) {
        this.file_path = file_path;
        const json_data = await load_json_file(this.file_path);
        if (!json_data) {
            return;
        }
        
        this._parse_file_data(json_data);
    }

    public async _parse_file_data(json_data: TypeFile) {
        this.raw_data = json_data;
        this.node_types_version = json_data.version;
        this.node_types_id = json_data.id;
        
        // Parse Slot Types
        json_data.slot_types.forEach((type_data, type_name) => {
            const custom_type = new CustomSlotType(
                type_data.extends,
                type_data.default_data_type,
                type_data.conn_whitelist,
                type_name
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
}