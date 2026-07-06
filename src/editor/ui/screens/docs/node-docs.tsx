import { createMemo, JSXElement, For, Show } from "solid-js";
import { SceneController } from "~/wrapper/controllers/scene-controller";
import { BaseNodeConstructor } from "~/wrapper/helpers/node-constructor";
import { NodeDataModel, SlotData } from "~/wrapper/helpers/node-type-file";
import { NodeTypeMeta, ParameterMeta, SlotMeta } from "~/wrapper/metadata/type_metadata";
import { DropdownSection } from "../../components/panels/dropdown";
import { NodePreview } from "../../editor/components/node/node-component";
import { SlotHeader } from "../../editor/components/node/slot-components";
import { NodeParameter } from "~/wrapper/nodes/data/node-data";
import { NodeFieldSelector } from '../../editor/components/node/node-field';
import InputIcon from "~/assets/icons/input.svg";
import OutputIcon from "~/assets/icons/output.svg";
import ToolIcon from "~/assets/icons/tool.svg";
import FilterIcon from "~/assets/icons/filter.svg";


export const NodeDocsContent = (props: {
    path: () => string | undefined,
    data?: NodeTypeMeta,
    scene_controller: SceneController,
    devMode: boolean
}) => {
    if (!props.data) {
        return <span>Couldn't load documentation</span>
    }

    const constructor = createMemo(() => {
        const path = props.path() ?? "";
        const type_id = path.split("/").at(-1);
        if (type_id) {
            const node_constructor = props.scene_controller.node_controller.node_constructors.get(type_id)
            return node_constructor;
        }
        return undefined;
    });

    const preview = createMemo(() => {
        const node_constructor = constructor();
        if (node_constructor) {
            return <NodePreview constructor={node_constructor}/>
        }
        return <span>Couldn't parse Node Preview</span>
    });

    

    return (
        <div class="keep fill container docs-sections">
            <div class="text-section">
                <h3>Preview</h3>
                <div class="remove-input all">
                    {preview()}            
                </div>
            </div>
            <NodeSlotSection data={props.data} constructor={constructor()} scene_controller={props.scene_controller} devMode={props.devMode}/>
            <NodeParameterSection data={props.data} constructor={constructor()} devMode={props.devMode}/>
        </div>
    )
}

interface DropdownBadge {
    icon?: JSXElement;
    label: string;
}

function resolve_slot_type_label(slotData: SlotData): string {
    if (slotData.data_type && slotData.data_type != "unknown") {
        return slotData.data_type;
    }

    return slotData.type?.split(":").at(-1) ?? "unknown";
}

const BadgeTag = (props: { badge: DropdownBadge }) => (
    <div class="tag-holder">
        {props.badge.icon}
        {props.badge.label}
    </div>
);

const SlotDropdownItem = (props: {
    slot_id: string;
    slot_data: SlotData;
    slot_meta: SlotMeta;
    devMode: boolean;
}) => {
    const badges = createMemo<DropdownBadge[]>(() => {
        const badge_list: DropdownBadge[] = [
            {
                label: resolve_slot_type_label(props.slot_data),
                icon: props.slot_data.is_input ? <InputIcon class="tag-icon" /> : <OutputIcon class="tag-icon" />
            }
        ];

        if (props.slot_data.max_connections) {
            badge_list.push({ label: `max: ${props.slot_data.max_connections}` });
        }
        return badge_list;
    });

    return (
        <DropdownSection
            header_content={() => (
                <div class="fill keep row-container space-between">
                    <div class="docs-slot-header">
                        <SlotHeader slot_id={props.slot_id} slot_meta={props.slot_meta} slot_data={props.slot_data} />
                        <div class="docs-header-badges">
                            <For each={badges()}>{(badge) => <BadgeTag badge={badge}/>}</For>
                        </div>
                    </div>
                    <Show when={props.devMode}>
                        <span style={{"min-width": "fit-content"}}>{props.slot_id}</span>
                    </Show>
                </div>
            )}
            content={
                <div>
                    <div class="text-section">
                        <h4>Description</h4>
                        <p>{props.slot_meta.description}</p>
                    </div>
                    <Show when={props.slot_data.max_connections}>
                        <div class="text-section">
                            <h4>Max Connections: {props.slot_data.max_connections}</h4>
                        </div>
                    </Show>
                </div>
            }
        />
    );
};

export const NodeSlotSection = (props: {
    data: NodeTypeMeta;
    constructor?: BaseNodeConstructor;
    scene_controller: SceneController;
    devMode: boolean;
}) => {
    const slot_bundle = createMemo(() => {
        const meta = props.data.slot_meta;
        const bundles: Array<[SlotData, SlotMeta, string]> = [];
        
        props.constructor?._slots.forEach((slotData, slotId) => {
            const slotMeta = meta[slotId];
            if (slotMeta) bundles.push([slotData, slotMeta, slotId]);
        });
        return bundles;
    });

    return (
        <div class="text-section">
            <h3>Slots</h3>
            <Show when={slot_bundle().length > 0} fallback={
                <span>This node has no Slots</span>
            }>
                <div class="fill keep container">
                    <For each={slot_bundle()}>
                        {([slotData, slotMeta, slotId]) => (
                            <SlotDropdownItem 
                                slot_id={slotId} 
                                slot_data={slotData} 
                                slot_meta={slotMeta} 
                                devMode={props.devMode} 
                                />
                            )}
                    </For>
                </div>
            </Show>
        </div>
    );
};

const ParameterDropdownItem = (props: {
    param_id: string;
    param_data: NodeDataModel;
    param_meta: ParameterMeta;
    devMode: boolean;
}) => {
    const parameter = createMemo(() => new NodeParameter(props.param_data, props.param_id));
    const badges = createMemo<DropdownBadge[]>(() => {
        const data = props.param_data;
        const list: DropdownBadge[] = [
            {
                label: data.type,
                icon: <ToolIcon class="tag-icon" />
            }
        ];

        if (data.default != undefined) {
            list.push({ label: `default: ${data.default}` });
        }
        if (data.step != undefined) {
            list.push({ label: `step: ${data.step}` });
        }
        if (data.range != undefined) {
            list.push({ label: `range` });
        }
        if (data.extension_filter != undefined) {
            if (data.extension_filter.length > 0) list.push({ icon: <FilterIcon class="tag-icon"/>, label: "" });
        }

        return list;
    });

    const formatValue = (val: any) => {
        return String(val);
    };

    return (
        <DropdownSection
            header_content={() => (
                <div class="fill keep row-container space-between">
                    <div class="docs-slot-header">
                        <span>
                            {props.param_meta.capitalized_name !== "" 
                                ? props.param_meta.capitalized_name 
                                : props.param_id}
                        </span>
                        <For each={badges()}>{(badge) => <BadgeTag badge={badge} />}</For>
                    </div>
                    <Show when={props.devMode}>
                        <span style={{ "min-width": "fit-content" }}>{props.param_id}</span>
                    </Show>
                </div>
            )}
            content={
                <div>
                    <div class="text-section">
                        <h4>Widget</h4>
                        <div class="remove-input all">
                            <NodeFieldSelector parameter={parameter()} hide_label={true} />
                        </div>
                    </div>

                    <div class="text-section">
                        <h4>Description</h4>
                        <p>{props.param_meta.description != "" ? props.param_meta.description : "No Description"}</p>
                    </div>

                    <Show when={props.param_data.default != undefined}>
                        <div class="text-section row">
                            <h4>Default Value:</h4>
                            <span>{formatValue(props.param_data.default)}</span>
                        </div>
                    </Show>

                    <Show when={props.param_data.step != undefined}>
                        <div class="text-section row">
                            <h4>Step Increment:</h4>
                            <span>{formatValue(props.param_data.step)}</span>
                        </div>
                    </Show>

                    <Show when={props.param_data.range != undefined}>
                        <div class="text-section row">
                            <h4>Allowed Range</h4>
                            <p>
                                Min: {props.param_data.range.min ?? "None"} |
                                Max: {props.param_data.range.max ?? "None"}
                            </p>
                        </div>
                    </Show>

                    <Show when={props.param_data.extension_filter != undefined && props.param_data.extension_filter?.length > 0}>
                        <div class="text-section">
                            <h4>Allowed Extensions</h4>
                            <div class="row-container">
                                <For each={props.param_data.extension_filter}>
                                    {(extension) => (
                                        <span class="tag-holder">{extension}</span>
                                    )}
                                </For>
                            </div>
                        </div>
                    </Show>

                    <Show when={props.param_data.options != undefined && props.param_data.options?.length > 0}>
                        <div class="text-section">
                            <h4>Available Options</h4>
                            <div class="row-container" style={{ "flex-wrap": "wrap" }}>
                                <For each={props.param_data.options}>
                                    {(option) => (
                                        <span class="tag-holder">{formatValue(option)}</span>
                                    )}
                                </For>
                            </div>
                        </div>
                    </Show>
                </div>
            }
        />
    );
};

export const NodeParameterSection = (props: {
    data: NodeTypeMeta;
    constructor?: BaseNodeConstructor;
    devMode: boolean;
}) => {
    const param_bundle = createMemo(() => {
        const meta = props.data.parameter_meta;
        const bundles: Array<[NodeDataModel, ParameterMeta, string]> = [];

        props.constructor?._data_model.raw_parameters.forEach((paramData, paramId) => {
            const paramMeta = meta[paramId];
            if (paramMeta) bundles.push([paramData, paramMeta, paramId]);
        });
        return bundles;
    });

    return (
        <div class="text-section">
            <h3>Parameters</h3>
            <Show when={param_bundle().length > 0} fallback={
                <span>This node has no parameters</span>
            }>
                <div class="fill keep container">
                    <For each={param_bundle()}>
                        {([paramData, paramMeta, paramId]) => (
                            <ParameterDropdownItem 
                                param_id={paramId} 
                                param_data={paramData} 
                                param_meta={paramMeta} 
                                devMode={props.devMode} 
                            />
                        )}
                    </For>
                </div>
            </Show>
        </div>
    );
};