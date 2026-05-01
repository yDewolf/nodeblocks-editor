import { GraphNode } from "../../../wrapper/nodes/graph-node";
import { NodeParameter } from "../../../wrapper/nodes/data/node-data";
import { DataTypes } from "../../../wrapper/nodes/data/node-data-type";
import { For, Match, Show, Switch } from "solid-js";
import { debounce } from "~/editor/utils/debounce-utils";
import { UserWorkspace } from "~/network/session/user-workspace";

export const NodeField = (props: {node: GraphNode | null, parameter: NodeParameter, workspace: UserWorkspace | undefined, parameter_sync: ((node: GraphNode, parameter: NodeParameter) => void) | undefined}) => {
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
        
        case DataTypes.FILE:
            input_type = "file";
            break
    }

    if (props.parameter._range) { input_type = "range" }

    const debouncedSync = debounce(props.parameter_sync!, 250);
    const onInputValueChanged = (raw_value: any) => {
        if (raw_value === "") return;

        let new_value: any = raw_value;
        if (input_type === "number" || input_type === "range") {
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
        <div class="node-field row-container" classList={{"remove-input": props.node == null}}>
            <label for={field_id}>{props.parameter._field_name}</label>
            <Switch fallback={
                <div>
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
            }>
                <Match when={input_type == "file"}>
                    <select>
                        <option value="">
                            
                        </option>
                        <For each={props.workspace ? props.workspace.files : []}>
                            {(file) => {
                                if (props.parameter._extension_filter && props.parameter._extension_filter.length > 0) {
                                    if (file.name) {
                                        if (!props.parameter._extension_filter.some((extension) => file.name.endsWith(extension))) {
                                            return;
                                        }
                                    }
                                }
                                return (
                                    <option value={file.name}>
                                        {file.name}
                                    </option>
                                )
                            }}
                        </For>
                    </select>
                </Match>
            </Switch>
        </div>
    );
}