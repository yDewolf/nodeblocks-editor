import { NodeParameterData } from "~/helpers/node-type-file";

export enum DataTypes {
    FLOAT,
    UINT,
    INT,
    ARRAY,
    CUSTOM,
    UNKNOWN
}

export class NodeDataType {
    type_name: string;
    
    _super_type: DataTypes = DataTypes.UNKNOWN;
    _type_whitelist: DataTypes[] = [];
    _name_whitelist: string[] = [];

    constructor(type_name: string, super_type: DataTypes, type_whitelist: DataTypes[], name_whitelist: string[] = []) {
        this.type_name = type_name;
        this._super_type = super_type;

        this._type_whitelist = type_whitelist;
        this._name_whitelist = name_whitelist;
    }


    public is_compatible_with(type: NodeDataType): boolean {
        if (this._type_whitelist.includes(type._super_type)) {
            return true;
        }

        if (this._name_whitelist.includes(type.type_name)) {
            return true;
        }

        return false;
    }
}

export class CustomNodeDataType extends NodeDataType {
    constructor(type_name: string, super_type: string, type_whitelist: string[]) {
        const [parsed_type_whitelist, name_whitelist] = CustomNodeDataType._parse_type_whitelist(type_whitelist);
        super(
            type_name,
            CustomNodeDataType._parse_super_type(super_type),
            parsed_type_whitelist,
            name_whitelist
        );
    }

    static _parse_super_type(type_str: string) {
        switch (type_str.toLowerCase()) {
            case "float": return DataTypes.FLOAT
            case "int": return DataTypes.INT
            case "uint": return DataTypes.UINT
            case "array": return DataTypes.ARRAY
            case "custom": return DataTypes.CUSTOM
        }

        return DataTypes.UNKNOWN
    }
    
    static _parse_type_whitelist(list: string[]): [DataTypes[], string[]] {
        let type_whitelist: DataTypes[] = [];
        let name_whitelist: string[] = [];
        list.forEach(element => {
            if (element == "") {
                return;
            }
            
            if (element.startsWith("#")) {
                type_whitelist = [...type_whitelist, CustomNodeDataType._parse_super_type(element.slice(1, element.length))];
                return;
            }

            name_whitelist = [...name_whitelist, element];
        });

        return [type_whitelist, name_whitelist];
    }

    static _match_data_type_str(type_str: string) {
        switch (type_str.toLowerCase()) {
            case "float": return FLOAT_TYPE
            case "int": return INT_TYPE
            case "uint": return UINT_TYPE
            case "array": return ARRAY_TYPE
            // case "custom": // Procurar o data type dentro do arquivo de node_types
        }
        return UNKNOWN_TYPE;
    }
}

export const FLOAT_TYPE = new NodeDataType("float", DataTypes.FLOAT, [DataTypes.FLOAT]);
export const INT_TYPE = new NodeDataType("int", DataTypes.INT, [DataTypes.INT, DataTypes.UINT]);
export const UINT_TYPE = new NodeDataType("uint", DataTypes.UINT, [DataTypes.UINT, DataTypes.INT]);
export const ARRAY_TYPE = new NodeDataType("array", DataTypes.ARRAY, [DataTypes.ARRAY]);
export const UNKNOWN_TYPE = new NodeDataType("unknown", DataTypes.UNKNOWN, [DataTypes.UNKNOWN]);
