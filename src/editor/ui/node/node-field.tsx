import { GraphNode } from "../../../wrapper/nodes/graph-node";
import { NodeParameter } from "../../../wrapper/nodes/data/node-data";
import { DefaultDataTypes } from "../../../wrapper/nodes/data/node-data-type";
import { createMemo, For, Match, Show, Switch } from "solid-js";
import { debounce } from "~/editor/utils/debounce-utils";
import { UserWorkspace } from "~/network/session/user-workspace";
import { clamp } from '../../utils/parameter-utils';
import { session_controller } from "~/singletons/user_session";

const TYPE_CONFIGS: Record<string, { type: string; step?: number; min?: number }> = {
    [DefaultDataTypes.FLOAT]: { type: "number", step: 0.1 },
    [DefaultDataTypes.INT]: { type: "number" },
    [DefaultDataTypes.UINT]: { type: "number", min: 0 },
    [DefaultDataTypes.FILE]: { type: "file" },
    [DefaultDataTypes.OPTIONS]: { type: "options" },
    [DefaultDataTypes.BOOLEAN]: { type: "boolean" },
};

export const NodeFieldSelector = (props: {
    node: GraphNode | null;
    parameter: NodeParameter;
    workspace: UserWorkspace | undefined;
    parameter_sync: ((node: GraphNode, parameter: NodeParameter) => void) | undefined;
}) => {
    let inputRef!: HTMLInputElement;
    const field_id = `${props.node?.id}${props.parameter._field_id}`;
    const baseConfig = TYPE_CONFIGS[props.parameter.type.base] || { type: "text" };

    const is_range = props.parameter._range != null
    const input_type = baseConfig.type;
    const step = props.parameter._step ?? baseConfig.step;
    const min = props.parameter._range?.at(0) ?? baseConfig.min;
    const max = props.parameter._range?.at(1);
    
    const debouncedSync = debounce((n: GraphNode, p: NodeParameter) => props.parameter_sync?.(n, p), 250);
    const onInputValueChanged = (raw_value: any) => {
        if (raw_value === "") return;

        let new_value = raw_value;
        if (input_type === "number" && is_range) {
            const isFloat = props.parameter.type.base === DefaultDataTypes.FLOAT;
            const parsed = isFloat ? parseFloat(raw_value) : parseInt(raw_value);
            if (isNaN(parsed)) return;
            new_value = clamp(parsed, min, max);
        }

        if (new_value !== props.parameter.value) {
            props.parameter.value = new_value;
        }

        if (props.node) debouncedSync(props.node, props.parameter);
        if (inputRef) inputRef.value = props.parameter.value.toString();
    };

    return (
        <div class="field-grid">
            <label class="field-label" for={field_id}>{props.parameter._field_id}</label>
            <Switch fallback={
                <NumberField
                    step={step}
                    min={min}
                    max={max}
                    is_range={is_range}
                    onInputValueChanged={onInputValueChanged} inputRef={inputRef} field_id={field_id} parameter={props.parameter}
                />
            }>
                <Match when={input_type === "options"}>
                    <OptionField options={() => {
                            return props.parameter._options?.values().toArray() ?? [];
                        }} onInputValueChanged={onInputValueChanged} inputRef={inputRef} field_id={field_id} parameter={props.parameter}
                    />
                </Match>
                <Match when={input_type === "file"}>
                    <FileOptions onInputValueChanged={onInputValueChanged} inputRef={inputRef} field_id={field_id} parameter={props.parameter}/>
                </Match>
                <Match when={input_type === "boolean"}>
                    <BooleanField onInputValueChanged={onInputValueChanged} inputRef={inputRef} field_id={field_id} parameter={props.parameter}/>
                </Match>
            </Switch>
        </div>
    )
}

const OptionField = (props: {
    inputRef: HTMLInputElement,
    field_id: string,
    parameter: NodeParameter,
    onInputValueChanged: (value: any) => void,
    options: () => Array<any>
}) => {
    return (
        <select 
            id={props.field_id} 
            value={props.parameter.value} 
            onchange={(e) => props.onInputValueChanged(e.currentTarget.value)}
        >
            <option value="" />
            <For each={props.options()}>
                {(item) => (
                    <option value={item}>
                        {item}
                    </option>
                )}
            </For>
        </select>
    )
}

const FileOptions = (props: {
    inputRef: HTMLInputElement,
    field_id: string,
    parameter: NodeParameter,
    onInputValueChanged: (value: any) => void,
}) => {
    const filteredFiles = createMemo(() => {
        const files = session_controller.user_workspace.files || [];
        const filters = props.parameter._extension_filter;
        
        if (!filters || filters.length === 0) return files;
        return files.filter(f => f.name && filters.some(ext => f.name.endsWith(ext)));
    });
    return (
        <OptionField options={filteredFiles} 
            onInputValueChanged={props.onInputValueChanged} inputRef={props.inputRef} field_id={props.field_id} parameter={props.parameter}
        />
    )
}

const NumberField = (props: {
    inputRef: HTMLInputElement,
    field_id: string,
    parameter: NodeParameter,
    onInputValueChanged: (value: any) => void,
    step?: number,
    min?: number,
    max?: number,
    is_range: boolean
}) => {
    return (
        <div>
            <input
                type="number"
                ref={props.inputRef}
                id={props.field_id}
                value={props.parameter.value ?? ""}
                step={props.step}
                min={props.min}
                max={props.max}
                onchange={(e) => { e.preventDefault(); props.onInputValueChanged(e.currentTarget.value); }}
                onPointerDown={(e) => e.stopPropagation()}
            />
            <Show when={props.is_range}>{props.parameter.value}</Show>
        </div>
    )
}

const BooleanField = (props: {
    inputRef: HTMLInputElement,
    field_id: string,
    parameter: NodeParameter,
    onInputValueChanged: (value: any) => void,
}) => {
    return (
        <input
            id={props.field_id}
            type="checkbox"
            checked={props.parameter.value ?? props.parameter._default ?? false}
            onPointerDown={(e) => e.stopPropagation()}
            onchange={(e) => props.onInputValueChanged(e.currentTarget.checked)}
        />
    )
}