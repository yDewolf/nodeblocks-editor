export enum DataTypes {
    FLOAT = "float",
    UINT = "uint",
    INT = "int",
    ARRAY = "array",
    CUSTOM = "custom",
    UNKNOWN = "unknown"
}

export enum SuperSlotTypes {
    INPUT = "input_slot",
    OUTPUT = "output_slot",
    UNKNOWN = "unknown"
}

export enum DataGroup {
    NODE = "node",
    SLOT = "slot"
}

export abstract class BaseDataType<Group extends DataGroup, SuperType> {
    constructor(
        public type_name: string,
        private _data_group: Group,
        public super_type: SuperType,
        public type_whitelist: SuperType[] = [],
        public name_whitelist: string[] = []
    ) {}

    public is_compatible_with(other: BaseDataType<Group, SuperType>): boolean {
        if (this._data_group !== other._data_group) return false;

        if (this.type_whitelist.includes(other.super_type)) return true;
        if (this.name_whitelist.includes(other.type_name)) return true;

        return false;
    }
}

export class BaseNodeType extends BaseDataType<DataGroup.NODE, DataTypes> {
    constructor(type_name: string, super_type: DataTypes, type_whitelist: DataTypes[], name_whitelist: string[] = []) {
        super(type_name, DataGroup.NODE, super_type, type_whitelist, name_whitelist);
    }
}

export class BaseSlotType extends BaseDataType<DataGroup.SLOT, SuperSlotTypes> {
    data_type: BaseNodeType
    constructor(type_name: string, data_type: BaseNodeType, super_type: SuperSlotTypes, type_whitelist: SuperSlotTypes[], name_whitelist: string[] = []) {
        super(type_name, DataGroup.SLOT, super_type, type_whitelist, name_whitelist);
        this.data_type = data_type; //== UNKNOWN_TYPE ? ;
    }
}

// Default Types:

export const FLOAT_TYPE = new BaseNodeType("float", DataTypes.FLOAT, [DataTypes.FLOAT]);
export const INT_TYPE = new BaseNodeType("int", DataTypes.INT, [DataTypes.INT, DataTypes.UINT]);
export const UINT_TYPE = new BaseNodeType("uint", DataTypes.UINT, [DataTypes.UINT, DataTypes.INT]);
export const ARRAY_TYPE = new BaseNodeType("array", DataTypes.ARRAY, [DataTypes.ARRAY]);
export const UNKNOWN_TYPE = new BaseNodeType("unknown", DataTypes.UNKNOWN, [DataTypes.UNKNOWN]);
const DEFAULT_NODE_TYPES = new Map<string, BaseNodeType>([
    [FLOAT_TYPE.type_name, FLOAT_TYPE],
    [INT_TYPE.type_name, INT_TYPE],
    [UINT_TYPE.type_name, UINT_TYPE],
    [ARRAY_TYPE.type_name, ARRAY_TYPE],
    [UNKNOWN_TYPE.type_name, UNKNOWN_TYPE]
]);

export const INPUT_SLOT  = new BaseSlotType("input_slot", UNKNOWN_TYPE, SuperSlotTypes.INPUT, [SuperSlotTypes.OUTPUT]);
export const OUTPUT_SLOT = new BaseSlotType("output_slot", UNKNOWN_TYPE, SuperSlotTypes.OUTPUT, [SuperSlotTypes.INPUT]);
export const UNKNOWN_SLOT_TYPE = new BaseSlotType("unknown_slot", UNKNOWN_TYPE, SuperSlotTypes.UNKNOWN, [SuperSlotTypes.UNKNOWN]);
const DEFAULT_SLOT_TYPES = new Map<string, BaseSlotType>([
    [INPUT_SLOT.type_name, INPUT_SLOT],
    [OUTPUT_SLOT.type_name, OUTPUT_SLOT],
]);

export class DataTypeUtils {
    static _match_node_data_type(str: string): BaseNodeType {
        if (!str) return UNKNOWN_TYPE;
        const super_str = str.toLowerCase();
        const node_type = DEFAULT_NODE_TYPES.get(super_str);
        
        return node_type != undefined ? node_type : UNKNOWN_TYPE;
    }

     static _match_slot_type(str: string): BaseSlotType {
        const super_str = str.toLowerCase();
        const node_type = DEFAULT_SLOT_TYPES.get(super_str);
        
        return node_type != undefined ? node_type : UNKNOWN_SLOT_TYPE;
    }

    static parse_data_type(str: string): DataTypes {
        const lower_str = str.toLowerCase();
        return (Object.values(DataTypes) as string[]).includes(lower_str) ? lower_str as DataTypes : DataTypes.UNKNOWN;
    }

    static parse_slot_super_type(str: string): SuperSlotTypes {
        const lower_str = str.toLowerCase();
        return (Object.values(SuperSlotTypes) as string[]).includes(lower_str) ? lower_str as SuperSlotTypes : SuperSlotTypes.UNKNOWN;
    }

    static parse_whitelist<SuperType>(list: string[], parser: (str: string) => SuperType): [SuperType[], string[]] {
        const type_whitelist: SuperType[] = [];
        const name_whitelist: string[] = [];
        list.forEach(item => {
            if (!item) return;
            if (item.startsWith("#")) {
                type_whitelist.push(parser(item.slice(1)));
                return;
            }
            name_whitelist.push(item);
        });

        return [type_whitelist, name_whitelist];
    }
}
