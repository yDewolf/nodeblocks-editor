import { CustomSlotType } from "~/components/nodes/slot/slot-type";
import { CustomNodeConstructor } from "./node-constructor";
import { NodeData } from "~/components/nodes/data/node-data";

async function load_json_file(path: string) {
    try {
        const response = await fetch(path);
        const data: TypeFile = await response.json();
        data.slot_types = new Map<string, SlotTypeData>(Object.entries(data.slot_types));
        data.node_types = new Map<string, NodeTypesData>(Object.entries(data.node_types));
        data.node_types.forEach(type_data => {
            type_data.slots = new Map<string, SlotData>(Object.entries(type_data.slots))
            type_data.parameters = new Map<string, NodeParameterData>(Object.entries(type_data.parameters))
        });

        return data;

    } catch (e) {
        console.error("Erro ao ler o arquivo local:", e);
    }

    return null;
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

    constructor() {
        this.slot_types = new Map();
        this.node_constructors = new Map();
    }

    public async load_file(file_path: string) {
        this.file_path = file_path;
        const json_data = await load_json_file(this.file_path);
        if (!json_data) {
            return;
        }
        
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
        json_data.node_types.forEach((type_data, type_name) => {
            const node_data: NodeData = new NodeData(type_data.parameters);
            const custom_type_constructor = new CustomNodeConstructor(
                type_name,
                node_data,
                type_data.slots,
                this.slot_types
            );
            this.node_constructors.set(type_name, custom_type_constructor);
        });
    }
}