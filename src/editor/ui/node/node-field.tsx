import { BaseNode } from "../../../wrapper/nodes/base-node";
import { NodeParameter } from "../../../wrapper/nodes/data/node-data";
import { DataTypes } from "../../../wrapper/nodes/data/node-data-type";


export const NodeField = (props: {node: BaseNode | null, parameter: NodeParameter}) => {
    const field_id = props.node?.id.toString() + props.parameter._field_name;
    let input_type = "text";
    switch (props.parameter.type.super_type) {
        case DataTypes.FLOAT: input_type = "number";
        case DataTypes.INT: input_type = "number";
        case DataTypes.UINT: input_type = "number";
    }

    const onBeforeInput = (event: InputEvent) => {
        let value = event.data;
        if (!value) {
            return;
        }

        if ((props.parameter._range && props.parameter._range.length > 1)) {
            const minimum = props.parameter._range[0];
            const maximum = props.parameter._range[-1];
            
            const parsed_value = Number.parseFloat(value);
            if (parsed_value < minimum || parsed_value > maximum) {
                event.preventDefault()
            }
        }
    }

    const onInputValueChanged = (new_value: any) => {
        // if (typeof new_value == typeof props.parameter.value) {
        console.log("DEBUG: Setting parameter ", props.parameter._field_name, "of node ", props.node?.id, " to ", new_value, " previous value: ", props.parameter.value);
        if (input_type == "number") {
            new_value = Number.parseFloat(new_value);
        }
        props.parameter.value = new_value;
        // }
    }

    return (
        <div class="node-field" classList={{"remove-input": props.node == null}}>
            <label for={field_id}>{props.parameter._field_name}</label>
            <input name={field_id} type={input_type} onBeforeInput={(event) => onBeforeInput(event)} onInput={(event) => onInputValueChanged(event.currentTarget.value)}/>
        </div>
    );
}