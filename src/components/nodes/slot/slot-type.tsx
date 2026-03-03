import { CustomNodeDataType, NodeDataType, UNKNOWN_TYPE } from "../data/node-data-type";

export enum SuperSlotTypes {
    INPUT,
    OUTPUT,
    UNKNOWN
}

export class BaseSlotType {
    type_name: string;
    data_type: NodeDataType;
    super_type: SuperSlotTypes;
    
    type_whitelist: SuperSlotTypes[];
    name_whitelist: string[];

    constructor(type: SuperSlotTypes, data_type: NodeDataType, slot_type_whitelist: SuperSlotTypes[], type_name: string = "default", name_whitelist: string[] = []) {
        this.super_type = type;
        this.data_type = data_type;
        this.type_whitelist = slot_type_whitelist;

        this.type_name = type_name;
        this.name_whitelist = name_whitelist;
    }

    public can_connect_to(other_type: BaseSlotType): boolean {
        if (this.type_whitelist.includes(other_type.super_type)) {
            return true;
        }

        if (this.name_whitelist.includes(other_type.type_name)) {
            return true;
        }

        return false;
    }
}

export class CustomSlotType extends BaseSlotType {
    constructor(type: string, default_data_type: string, type_whitelist: string[], type_name: string) {
        const parsed_type = CustomSlotType._parse_super_type(type);
        const data_type = CustomNodeDataType._match_data_type_str(default_data_type);
        const [parsed_type_wl, parsed_name_wl] = CustomSlotType._parse_type_whitelist(type_whitelist);

        super(parsed_type, data_type, parsed_type_wl, type_name, parsed_name_wl);
    }
    
    static _parse_super_type(type_str: string) {
        switch (type_str.toLowerCase()) {
            case "input_slot": return SuperSlotTypes.INPUT
            case "output_slot": return SuperSlotTypes.OUTPUT
        }

        return SuperSlotTypes.UNKNOWN
    }

    static _parse_type_whitelist(list: string[]): [SuperSlotTypes[], string[]] {
        let type_whitelist: SuperSlotTypes[] = [];
        let name_whitelist: string[] = [];
        list.forEach(element => {
            if (element == "") {
                return;
            }
            
            if (element.startsWith("#")) {
                type_whitelist = [...type_whitelist, CustomSlotType._parse_super_type(element.slice(1, element.length))];
                return;
            }

            name_whitelist = [...name_whitelist, element];
        });

        return [type_whitelist, name_whitelist];
    }
}

export const INPUT_SLOT = new BaseSlotType(SuperSlotTypes.INPUT, UNKNOWN_TYPE, [SuperSlotTypes.OUTPUT], "default_input");
export const OUTPUT_SLOT = new BaseSlotType(SuperSlotTypes.OUTPUT, UNKNOWN_TYPE, [SuperSlotTypes.INPUT], "default_output");
