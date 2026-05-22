export enum DefaultDataTypes {
    FLOAT = "float",
    UINT = "uint",
    INT = "int",
    ARRAY = "array",
    CUSTOM = "custom",
    FILE = "file",
    UNKNOWN = "unknown"
}

export enum DefaultRenderers {
    SCALAR = "scalar",
    ARRAY = "array",
    TEXT = "text",
    NOT_IMPLEMENTED = "not_implemented"
}

export function _match_renderer(base_type: DefaultDataTypes): DefaultRenderers {
    switch (base_type) {
        case DefaultDataTypes.ARRAY: return DefaultRenderers.ARRAY;
        case DefaultDataTypes.FLOAT: return DefaultRenderers.SCALAR;
        case DefaultDataTypes.INT: return DefaultRenderers.SCALAR;
        case DefaultDataTypes.UINT: return DefaultRenderers.SCALAR;
        default:
            return DefaultRenderers.NOT_IMPLEMENTED
    }
}

export class BaseDataType {
    renderer: DefaultRenderers;
    constructor(
        public type_id: string,
        public base: DefaultDataTypes,
        public type_whitelist: DefaultDataTypes[] = [],
        public name_whitelist: string[] = [],
        renderer: DefaultRenderers | undefined  = undefined,
    ) {
        if (renderer == undefined) {
            renderer = _match_renderer(this.base)
        }

        this.renderer = renderer
    }

    public is_compatible_with(other: BaseDataType): boolean {
        if (this.type_whitelist.includes(other.base)) return true;
        if (this.name_whitelist.includes(other.type_id)) return true;

        return false;
    }
}

// Default Types:

export const FLOAT_TYPE = new BaseDataType("float", DefaultDataTypes.FLOAT, [DefaultDataTypes.FLOAT]);
export const INT_TYPE = new BaseDataType("int", DefaultDataTypes.INT, [DefaultDataTypes.INT, DefaultDataTypes.UINT]);
export const UINT_TYPE = new BaseDataType("uint", DefaultDataTypes.UINT, [DefaultDataTypes.UINT, DefaultDataTypes.INT]);
export const ARRAY_TYPE = new BaseDataType("array", DefaultDataTypes.ARRAY, [DefaultDataTypes.ARRAY]);
export const FILE_TYPE = new BaseDataType("file", DefaultDataTypes.FILE, [DefaultDataTypes.FILE]);
export const UNKNOWN_TYPE = new BaseDataType("unknown", DefaultDataTypes.UNKNOWN, [DefaultDataTypes.UNKNOWN]);
const DEFAULT_TYPES = new Map<string, BaseDataType>([
    [FLOAT_TYPE.type_id, FLOAT_TYPE],
    [INT_TYPE.type_id, INT_TYPE],
    [UINT_TYPE.type_id, UINT_TYPE],
    [ARRAY_TYPE.type_id, ARRAY_TYPE],
    [FILE_TYPE.type_id, FILE_TYPE],
    [UNKNOWN_TYPE.type_id, UNKNOWN_TYPE]
]);

export class DataTypeUtils {
    static _match_default_data_type(str: string): BaseDataType {
        if (!str) return UNKNOWN_TYPE;
        const super_str = str.toLowerCase();
        const node_type = DEFAULT_TYPES.get(super_str);
        
        return node_type != undefined ? node_type : UNKNOWN_TYPE;
    }

    static parse_data_type(str: string): DefaultDataTypes {
        const lower_str = str.toLowerCase();
        return (Object.values(DefaultDataTypes) as string[]).includes(lower_str) ? lower_str as DefaultDataTypes : DefaultDataTypes.UNKNOWN;
    }

    static parse_whitelist<SuperType>(list: string[], default_type_parser: (str: string) => SuperType): [SuperType[], string[]] {
        const type_whitelist: SuperType[] = [];
        const name_whitelist: string[] = [];
        list.forEach(item => {
            if (!item) return;
            if (item.startsWith("#")) {
                type_whitelist.push(default_type_parser(item.slice(1)));
                return;
            }
            name_whitelist.push(item);
        });

        return [type_whitelist, name_whitelist];
    }
}
