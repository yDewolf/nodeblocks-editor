import { NodeDataModel } from "~/wrapper/helpers/node-type-file";
import { createSignal } from "solid-js";
import { BaseDataType, DataTypeUtils, DefaultDataTypes } from "./node-data-type";

export class NodeParameter {
    type: BaseDataType;
    _default: any | null = null;
    _field_id: string;

    _step: number | null = null;
    _range: number[] | null = null;
    _extension_filter: string[] | null = null;
    _options: Array<any> | null = null
    _options_type: DefaultDataTypes | null = null;

    _raw_field_data: NodeDataModel;

    _set_value: (value: any) => void;
    _value: () => any;

    constructor(field_data: NodeDataModel, field_id: string) {
        this._field_id = field_id;
        this._raw_field_data = field_data;
        if (field_data.default) { this._default = field_data.default; }
        if (field_data.step) { this._step = field_data.step; }
        if (field_data.range) { this._range = field_data.range; }
        if (field_data.extension_filter) { this._extension_filter = field_data.extension_filter; }
        if (field_data.options) { this._options = field_data.options }
        if (field_data.option_type) { this._options_type = field_data.option_type as DefaultDataTypes}

        const [getValue, setValue] = createSignal(this._default);
        this._value = getValue;
        this._set_value = setValue;

        const field_type: BaseDataType = DataTypeUtils._match_default_data_type(field_data.type);
        this.type = field_type;
    }

    get value() { return this._value(); }
    set value(new_value: any) { this._set_value(new_value); }
}

export class NodeData {
    parameters: Map<string, NodeParameter>
    raw_parameters: Map<string, NodeDataModel>

    constructor(raw_params: Map<string, NodeDataModel>) {
        this.raw_parameters = raw_params;
        this.parameters = NodeData.parse_parameters(raw_params);
    }

    static parse_parameters(fields: Map<string, NodeDataModel>): Map<string, NodeParameter> {
        let parsed_fields: Map<string, NodeParameter> = new Map(); 
        fields.forEach((field_data, field_id) => {
            const obj = new NodeParameter(
                field_data, field_id
            );
            parsed_fields.set(field_id, obj);
        });

        return parsed_fields;
    }

    public map_parameters(): Map<string, any> {
        let parameters = new Map();
        this.parameters.forEach((param, key) => {
            parameters.set(key, param.value);
        });

        return parameters;
    }
}
