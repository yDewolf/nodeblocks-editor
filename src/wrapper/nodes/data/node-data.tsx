import { NodeParameterData } from "~/wrapper/helpers/node-type-file";
import { CustomNodeDataType, NodeDataType } from "./node-data-type";
import { createSignal } from "solid-js";

export class NodeParameter {
    type: NodeDataType
    _range: number[] | null = null
    _field_name: string

    _raw_field_data: NodeParameterData

    _set_value: (value: any) => void;
    _value: () => any;

    constructor(field_data: NodeParameterData, field_name: string) {
        this._field_name = field_name;
        this._raw_field_data = field_data;
        if (field_data.range) {
            this._range = field_data.range;
            console.log(this._range);
        }

        const [getValue, setValue] = createSignal(null);
        this._value = getValue;
        this._set_value = setValue;

        const field_type: NodeDataType = CustomNodeDataType._match_data_type_str(field_data.type);
        this.type = field_type;
    }

    get value() { return this._value(); }
    set value(new_value: any) { this._set_value(new_value); }
}

export class NodeData {
    parameters: Map<string, NodeParameter>
    raw_parameters: Map<string, NodeParameterData>

    constructor(raw_params: Map<string, NodeParameterData>) {
        this.raw_parameters = raw_params;
        this.parameters = NodeData.parse_parameters(raw_params);
    }

    static parse_parameters(fields: Map<string, NodeParameterData>): Map<string, NodeParameter> {
        let parsed_fields: Map<string, NodeParameter> = new Map(); 
        fields.forEach((field_data, field_name) => {
            const obj = new NodeParameter(
                field_data, field_name
            );
            parsed_fields.set(field_name, obj);
        });

        return parsed_fields;
    }

    public map_parameters(): Map<string, any> {
        let parameters = new Map();
        this.parameters.forEach((param, key) => {
            parameters.set(key, param.value);
        })

        return parameters;
    }
}

export { CustomNodeDataType };
