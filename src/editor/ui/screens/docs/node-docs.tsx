import { createMemo, JSXElement, For, Show } from "solid-js";
import { SceneController } from "~/wrapper/controllers/scene-controller";
import { BaseNodeConstructor } from "~/wrapper/helpers/node-constructor";
import { NodeDataModel, SlotData } from "~/wrapper/helpers/node-type-file";
import { NodeTypeMeta, ParameterMeta, SlotMeta } from "~/wrapper/metadata/type_metadata";
import { DropdownSection } from "../../components/panels/dropdown";
import { NodePreview } from "../../editor/components/node/node-component";
import { SlotHeader } from "../../editor/components/node/slot-components";
import InputIcon from "~/assets/icons/input.svg";
import OutputIcon from "~/assets/icons/output.svg";
import ToolIcon from "~/assets/icons/tool.svg";
import { NodeParameter } from "~/wrapper/nodes/data/node-data";
import { NodeFieldSelector } from '../../editor/components/node/node-field';

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
    icon?: JSXElement,
    label: string
}

const NodeSlotSection = (props: {
    data: NodeTypeMeta,
    constructor?: BaseNodeConstructor,
    scene_controller: SceneController,
    devMode: boolean
}) => {
    const slots = createMemo(() => {
        const meta = props.data.slot_meta;
        const node_constructor = props.constructor;
        let slot_bundle: Array<[SlotData, SlotMeta, string]> = []
        node_constructor?._slots.forEach((slot_data, slot_id) => {
            const slot_meta = meta[slot_id];
            if (slot_meta) {
                slot_bundle.push([slot_data, slot_meta, slot_id]);
            }
        })

        return slot_bundle;
    });

    return (
        <div class="text-section">
            <h3>Slots</h3>
            <div class="fill keep container">
                <For each={slots()}>
                    {([slot_data, slot_meta, slot_id]) => {
                        let slot_badges: Array<DropdownBadge> = [];
                        // FIXME: This DataType label shouldn't be always unknown for custom DataTypes...
                        slot_badges.push({
                            label: slot_data.data_type != "unknown" ? (slot_data.data_type ?? "null") : (slot_data.type.split(":").at(-1) ?? "undefined"),
                            icon: slot_data.is_input ? <InputIcon class="tag-icon"/> : <OutputIcon class="tag-icon"/>
                        })
                        if (slot_data.max_connections) {
                            slot_badges.push({
                                label: `max: ${slot_data.max_connections}`
                            });
                        }

                        return (
                            <DropdownSection 
                                header_content={() => {
                                    return (
                                        <div class="fill keep row-container space-between">
                                            <div class="docs-slot-header">
                                                <SlotHeader slot_id={slot_id} slot_meta={slot_meta} slot_data={slot_data} />
                                                <For each={slot_badges}>
                                                    {(badge) => (
                                                        <div class="tag-holder">
                                                            {badge.icon}
                                                            {badge.label}
                                                        </div>
                                                    )}
                                                </For>
                                            </div>
                                            <Show when={props.devMode}>
                                                <span style={{"min-width": "fit-content"}}>{slot_id}</span>
                                            </Show>
                                        </div>
                                    )
                                }}
                                content={
                                    <div>
                                        <div class="text-section">
                                            <h4>Description</h4>
                                            <p>{slot_meta.description}</p>
                                        </div>
                                        <Show when={slot_data.max_connections}>
                                            <div class="text-section">
                                                <h4>Max Connections: {slot_data.max_connections}</h4>
                                            </div>
                                        </Show>
                                    </div>
                                }
                            />
                        )
                    }}
                </For>
            </div>
        </div>
    )
}

const NodeParameterSection = (props: {
    data: NodeTypeMeta,
    constructor?: BaseNodeConstructor,
    devMode: boolean
}) => {
    const parameters = createMemo(() => {
        const meta = props.data.parameter_meta;
        let param_bundle: Array<[NodeDataModel, ParameterMeta, string]> = []
        props.constructor?._data_model.raw_parameters.forEach((param_data, param_id) => {
            const param_meta = meta[param_id];
            if (param_meta) {
                param_bundle.push([param_data, param_meta, param_id]);
            }
        })

        return param_bundle;
    })
    return (
        <div class="text-section">
            <h3>Parameters</h3>
            <div class="fill keep container">
                <For each={parameters()}>
                    {([param_data, param_meta, param_id]) => {
                        let param_badges: Array<DropdownBadge> = [];
                        param_badges.push({
                            label: param_data.type,
                            icon: <ToolIcon class="tag-icon"/>
                        });
                        const parameter = new NodeParameter(param_data, param_id);
                        return (
                            <DropdownSection 
                                header_content={() => {
                                    return (
                                        <div class="fill keep row-container space-between">
                                            <div class="docs-slot-header">
                                                <span>{param_meta.capitalized_name != "" ? param_meta.capitalized_name : param_id}</span>
                                                <For each={param_badges}>
                                                    {(badge) => (
                                                        <div class="tag-holder">
                                                            {badge.icon}
                                                            {badge.label}
                                                        </div>
                                                    )}
                                                </For>
                                            </div>
                                            <Show when={props.devMode}>
                                                <span style={{"min-width": "fit-content"}}>{param_id}</span>
                                            </Show>
                                        </div>
                                    )
                                }}
                                content={
                                    <div>
                                        <div class="text-section">
                                            <h4>Widget</h4>
                                            <div class="remove-input all">
                                                <NodeFieldSelector parameter={parameter} hide_label={true}/>
                                            </div>
                                        </div>
                                        <div class="text-section">
                                            <h4>Description</h4>
                                            <p>{param_meta.description}</p>
                                        </div>
                                    </div>
                                }
                            />
                        )
                    }}
                </For>
            </div>
        </div>
    )
}