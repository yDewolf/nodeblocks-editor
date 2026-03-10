import { NodeParameterData } from "~/helpers/node-type-file";
import { CustomNodeDataType, NodeDataType } from "./node-data-type";

export class NodeParameter {
    type: NodeDataType
    _field_name: string

    _raw_field_data: NodeParameterData

    constructor(field_data: NodeParameterData, field_name: string) {
        this._field_name = field_name;
        this._raw_field_data = field_data;

        const field_type: NodeDataType = CustomNodeDataType._match_data_type_str(field_data.type);
        this.type = field_type;
    }
}

export class NodeData {
    parameters: Map<string, NodeParameter>

    constructor(parameters: Map<string, NodeParameterData>) {
        this.parameters = NodeData.parse_parameters(parameters);
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
}

export { CustomNodeDataType };
