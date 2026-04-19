import { GraphNode } from "../../../wrapper/nodes/graph-node";
import { NodeParameter } from "../../../wrapper/nodes/data/node-data";
import { DataTypes } from "../../../wrapper/nodes/data/node-data-type";
import { Show } from "solid-js";

export const debounce = (func: Function, wait: number) => {
    let timeout: any;
    return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

export const NodeField = (props: {node: GraphNode | null, parameter: NodeParameter, parameter_sync: ((node: GraphNode, parameter: NodeParameter) => void) | undefined}) => {
    let inputRef!: HTMLInputElement;
    
    const field_id = props.node?.id.toString() + props.parameter._field_name;
    let input_type = "text";
    let step = props.parameter._step ?? undefined;
    let min = props.parameter._range?.at(0);
    const max = props.parameter._range?.at(1);
    const clamp = (val: number, min?: number, max?: number) => {
        if (min !== undefined && val < min) return min;
        if (max !== undefined && val > max) return max;
        return val;
    };

    switch (props.parameter.type.super_type) {
        case DataTypes.FLOAT: 
            input_type = "number"; 
            step = step != undefined ? step : 0.1;
            break
        case DataTypes.INT: 
            input_type = "number";
            break

        case DataTypes.UINT: 
            input_type = "number"; 
            min = min != undefined ? min : 0;
            break
    }

    if (props.parameter._range) { input_type = "range" }

    const debouncedSync = debounce(props.parameter_sync!, 250);
    const onInputValueChanged = (raw_value: any) => {
        if (raw_value === "") return;

        let new_value: any = raw_value;
        if (input_type === "number") {
            let parsed = props.parameter.type.super_type === DataTypes.FLOAT ? parseFloat(raw_value) : parseInt(raw_value);
            if (isNaN(parsed)) return;

            new_value = clamp(parsed, min, max);
        }

        if (new_value !== props.parameter.value) {
            props.parameter.value = new_value;
        }

        debouncedSync();

        if (inputRef) {
            inputRef.value = props.parameter.value.toString()
        }
    }

    return (
        <div class="node-field" classList={{"remove-input": props.node == null}}>
            <label for={field_id}>{props.parameter._field_name}</label>
            <input
                ref={inputRef}
                name={field_id} 
                type={input_type}
                value={props.parameter.value ?? ""} 
                onInput={(event) => {
                    event.preventDefault();
                    onInputValueChanged(event.currentTarget.value)}
                }
                onPointerDown={(event) => {
                    event.stopPropagation();
                }}
                step={step}
                min={min}
                max={max}
            />
            <Show when={input_type == "range"}>{props.parameter.value}</Show>
        </div>
    );
}