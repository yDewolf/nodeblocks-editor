import { CustomSlotType } from "~/components/nodes/slot/slot-type";
import { CustomNodeConstructor } from "./node-constructor";

async function load_json_file(path: string) {
    try {
        const response = await fetch(path);
        const data: TypeFile = await response.json();
        data.slot_types = new Map<string, TypeData>(Object.entries(data.slot_types));
        data.node_types = new Map<string, NodeTypesData>(Object.entries(data.node_types));
        data.node_types.forEach(type_data => {
            type_data.slots = new Map<string, SlotData>(Object.entries(type_data.slots))
        });

        return data;

    } catch (e) {
        console.error("Erro ao ler o arquivo local:", e);
    }

    return null;
}

interface TypeFile {
    version: number,
    slot_types: Map<string, TypeData>,
    node_types: Map<string, NodeTypesData>
}

interface TypeData {
    extends: string,
    conn_whitelist: string[]
}

export interface SlotData {
    type: string,
    data_type: string,
    tooltip: string
}

interface NodeTypesData {
    description: string,
    slots: Map<string, SlotData>
}

export class NodeTypeFile {
    version: number = -1;
    file_path: string | null = null;

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

        this.version = json_data.version;
        
        // Parse Slot Types
        json_data.slot_types.forEach((type_data, type_name) => {
            const custom_type = new CustomSlotType(
                    type_data.extends,
                    type_data.conn_whitelist,
                    type_name
                );
            this.slot_types.set(type_name, custom_type);
        });

        // Parse Node Types
        json_data.node_types.forEach((type_data, type_name) => {
            const custom_type_constructor = new CustomNodeConstructor(
                type_name,
                type_data.slots,
                this.slot_types
            );
            this.node_constructors.set(type_name, custom_type_constructor);
        });
    }
}