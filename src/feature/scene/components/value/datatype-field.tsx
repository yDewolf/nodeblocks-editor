import { For, Match, Show, Switch } from "solid-js";
import { clamp } from '../../../../utils/parameter-utils';
import { ParameterSpec, OptionParam } from "~/protocols/nodeblocks/manifests/node/datatype-spec";
import { DefaultDataTypes } from "~/protocols/nodeblocks/manifests/node/datatype-enums";
import { useNodeMeta } from "~/feature/metadata/metadata-context";

const TYPE_CONFIGS: Record<string, { type: string; step?: number; min?: number }> = {
    [DefaultDataTypes.FLOAT]: { type: "number", step: 0.1 },
    [DefaultDataTypes.INT]: { type: "number" },
    [DefaultDataTypes.UINT]: { type: "number", min: 0 },
    // [DefaultDataTypes.FILE]: { type: "file" },
    [DefaultDataTypes.OPTIONS]: { type: "options" },
    [DefaultDataTypes.BOOLEAN]: { type: "boolean" },
    [DefaultDataTypes.TEXT]: { type: "text" },
    [DefaultDataTypes.UNKNOWN]: { type: "text" }
};

export const DataTypeFieldSelector = (props: {
    parameterId: string;
    parameterSpec: ParameterSpec;
    hide_label?: boolean;
    baseFieldId?: string;
    getCurrentValue?: () => any;
    onInputValueChanged?: (value: any, raw_value: any) => void;
}) => {
    let inputRef!: HTMLInputElement;
    const field_id = `${props.baseFieldId ?? 'global'}_${props.parameterId}`;
    const baseConfig = TYPE_CONFIGS[props.parameterSpec.type] || { type: "text" };

    const input_type = baseConfig.type;
    
    const is_range = (props.parameterSpec.type === DefaultDataTypes.FLOAT || props.parameterSpec.type === DefaultDataTypes.INT || props.parameterSpec.type === DefaultDataTypes.UINT) 
        && (('min' in props.parameterSpec && props.parameterSpec.min != undefined) || 'max' in props.parameterSpec && props.parameterSpec.max != undefined);
    
    const step = ('step' in props.parameterSpec ? props.parameterSpec.step : undefined) ?? baseConfig.step;
    const min = ('min' in props.parameterSpec ? props.parameterSpec.min : undefined) ?? baseConfig.min;
    const max = ('max' in props.parameterSpec ? props.parameterSpec.max : undefined) ?? undefined;

    const getCurrentValue = () => props.getCurrentValue?.() ?? props.parameterSpec.default;

    const onInputValueChanged = (raw_value: any) => {
        if (raw_value === "") return;
        let new_value = raw_value;
        if (input_type === "number") {
            const isFloat = props.parameterSpec.type === DefaultDataTypes.FLOAT;
            const parsed = isFloat ? parseFloat(raw_value) : parseInt(raw_value);
            if (isNaN(parsed)) return;
            new_value = parsed;
        }

        if (input_type === "number" && max != undefined) {
            new_value = Math.min(new_value, max)
        }

        if (input_type === "number" && min != undefined) {
            new_value = Math.max(new_value, min)
        }
        props.onInputValueChanged?.(new_value, raw_value);
        if (inputRef) inputRef.value = new_value.toString();
    };

    const param_meta = useNodeMeta()?.meta?.parameter_meta;
    const param_label = param_meta?.[props.parameterId] ? param_meta[props.parameterId].capitalized_name : props.parameterId;
    return (
        <div class="field-grid">
            <Show when={!props.hide_label}>
                <label class="field-label highlightable" title={props.parameterId} for={field_id}>
                    {param_label}
                </label>
            </Show>
            <Switch fallback={
                <NumberField
                    step={step}
                    min={min}
                    max={max}
                    is_range={is_range}
                    value={getCurrentValue()}
                    onInputValueChanged={onInputValueChanged} 
                    inputRef={inputRef} 
                    field_id={field_id} 
                />
            }>
                <Match when={input_type === "text"}>
                    <TextField value={getCurrentValue()} onInputValueChanged={onInputValueChanged} inputRef={inputRef} field_id={field_id} />
                </Match>
                <Match when={input_type === "options"}>
                    <OptionField 
                        value={getCurrentValue()}
                        options={() => (props.parameterSpec as OptionParam).options ?? []} 
                        onInputValueChanged={onInputValueChanged} 
                        inputRef={inputRef} 
                        field_id={field_id} 
                    />
                </Match>
                {/* <Match when={input_type === "file"}>
                    <FileOptions 
                        value={getCurrentValue()}
                        parameterSpec={props.parameterSpec as FileParam}
                        onInputValueChanged={onInputValueChanged} 
                        inputRef={inputRef} 
                        field_id={field_id} 
                    />
                </Match> */}
                <Match when={input_type === "boolean"}>
                    <BooleanField 
                        value={getCurrentValue()}
                        defaultValue={props.parameterSpec.default}
                        onInputValueChanged={onInputValueChanged} 
                        inputRef={inputRef} 
                        field_id={field_id} 
                    />
                </Match>
            </Switch>
        </div>
    );
};

const OptionField = (props: {
    inputRef: HTMLInputElement,
    field_id: string,
    value: any,
    onInputValueChanged: (value: any) => void,
    options: () => Array<any>
}) => {
    return (
        <select class="field-input"
            id={props.field_id} 
            value={props.value} 
            oninput={(e) => props.onInputValueChanged(e.currentTarget.value)}
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
    );
};

// const FileOptions = (props: {
//     inputRef: HTMLInputElement,
//     field_id: string,
//     value: any,
//     parameterSpec: FileParam,
//     onInputValueChanged: (value: any) => void,
// }) => {
//     const filteredFiles = createMemo(() => {
//         const files = session_controller.user_workspace?.files || [];
//         const filters = props.parameterSpec.extension_filter;
        
//         if (!filters || filters.length === 0) return files;
//         return files.filter(f => f.name && filters.some(ext => f.name.endsWith(ext)));
//     });

//     return (
//         <OptionField 
//             value={props.value}
//             options={() => filteredFiles().map(f => f.name)} 
//             onInputValueChanged={props.onInputValueChanged} 
//             inputRef={props.inputRef} 
//             field_id={props.field_id} 
//         />
//     );
// };

const TextField = (props: {
    inputRef: HTMLInputElement,
    field_id: string,
    value: any,
    onInputValueChanged: (value: any) => void,
}) => {
    return (
        <input class="field-input"
            type="text"
            ref={props.inputRef}
            id={props.field_id}
            value={props.value}
            oninput={(e) => { e.preventDefault(); props.onInputValueChanged(e.currentTarget.value); }}
            onPointerDown={(e) => e.stopPropagation()}
        />
    );
};

const NumberField = (props: {
    inputRef: HTMLInputElement,
    field_id: string,
    value: any,
    onInputValueChanged: (value: any) => void,
    step?: number,
    min?: number,
    max?: number,
    is_range: boolean
}) => {
    return (
        <div>
            <input class="field-input"
                type="number"
                ref={props.inputRef}
                id={props.field_id}
                value={props.value}
                step={props.step}
                min={props.min}
                max={props.max}
                oninput={(e) => { e.preventDefault(); props.onInputValueChanged(e.currentTarget.value); }}
                onPointerDown={(e) => e.stopPropagation()}
            />
            <Show when={props.is_range}>
                <span>
                    {props.min} {props.value} {props.max}
                </span>
            </Show>
        </div>
    );
};

const BooleanField = (props: {
    inputRef: HTMLInputElement,
    field_id: string,
    value: any,
    defaultValue?: boolean,
    onInputValueChanged: (value: any) => void,
}) => {
    return (
        <input class="field-input"
            id={props.field_id}
            type="checkbox"
            checked={props.value}
            onPointerDown={(e) => e.stopPropagation()}
            oninput={(e) => props.onInputValueChanged(e.currentTarget.checked)}
        />
    );
};