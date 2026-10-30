import { createMemo, JSXElement, For, Show, createSignal } from "solid-js";
import { NodeSlotSpec, NodeTypeSpec } from "~/protocols/nodeblocks/manifests/node/node-spec";
import InputIcon from "~/assets/icons/input.svg";
import OutputIcon from "~/assets/icons/output.svg";
import ToolIcon from "~/assets/icons/tool.svg";
import FilterIcon from "~/assets/icons/filter.svg";
import { DocsHref } from "../docs-reference";
import { NodeTypeMeta, ParameterMeta, SlotMeta } from "~/protocols/nodeblocks/metadata/type_metadata";
import { PackageManager } from "~/feature/editor/engine/packages/package-manager";
import { NamespaceUtils } from "~/protocols/nodeblocks/namespace-model";
import { DataTypeSpec, ParameterSpec } from "~/protocols/nodeblocks/manifests/node/datatype-spec";
import { DropdownSection } from "~/components/panels/dropdown";
import { ParsedMetaText } from "~/feature/metadata/components/metadata-text";
import { NodeMetaProvider, ensureMetadata } from "~/feature/metadata/metadata-context";
import { NodePreview } from "~/feature/scene/components/node/node-component";
import { SlotHeader } from "~/feature/scene/components/node/slot-components";
import { DocsPathUtils } from "../../helpers/docs-path-utils";
import { DataTypeFieldSelector } from "~/feature/scene/components/value/datatype-field";


export const NodeDocsContent = (props: {
    path: string | undefined,
    data: NodeTypeMeta,
    packageManager: PackageManager,
    devMode: boolean
}) => { 
    const [notif, setNotify] = createSignal(0);
    props.packageManager.subscribePackageLoad(() => setNotify(notif() + 1));
    
    const spec = createMemo(() => {
        notif();
        const package_id = DocsPathUtils.extractRootId(props.path ?? "");
        const type_id = DocsPathUtils.extractTargetId(props.path ?? "");

        const fqn = NamespaceUtils.makeFqn(package_id, type_id ?? "");
        if (!props.packageManager.registry.isNodeTypeRegistered(fqn)) {
            return undefined;
        }
        const spec = props.packageManager.registry.getNodeTypeSpec(fqn);
        return spec;
    })

    const preview = createMemo(() => {
        const nodespec = spec();
        if (nodespec) {
            return <NodePreview spec={nodespec}/>
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
            <NodeMetaProvider value={props.data}>
                <Show when={spec()}>
                    {(spec_data) => {
                        if (!props.data) { return undefined; }
                        return <>
                            <NodeSlotSection data={props.data} spec={spec_data()} packageManager={props.packageManager} devMode={props.devMode}/>
                            <NodeParameterSection data={props.data} spec={spec_data()} devMode={props.devMode}/>
                        </>
                    }}
                </Show>
            </NodeMetaProvider>
        </div>
    )
}

interface DropdownBadge {
    icon?: JSXElement;
    href?: string;
    label: string;
}

const BadgeTag = (props: { badge: DropdownBadge }) => (
    <div class="tag-holder">
        {props.badge.icon}
        <Show when={props.badge.href} fallback={
            <span>{props.badge.label}</span>
        }>
            <DocsHref class="field-link" route={props.badge.href ? {path: props.badge.href} : undefined}>
                {props.badge.label}
            </DocsHref>
        </Show>
    </div>
);

const SlotDropdownItem = (props: {
    slot_id: string,
    datatype: DataTypeSpec,
    slot_spec: NodeSlotSpec,
    slot_meta: SlotMeta,
    devMode: boolean,
}) => {
    const datatype_meta = ensureMetadata().get_datatype_meta(props.datatype.id, props.datatype.namespace);
    const badges = createMemo<DropdownBadge[]>(() => {
        const badge_list: DropdownBadge[] = [
            {
                label: datatype_meta?.capitalized_name ?? props.slot_spec.datatype_fqn,
                href: DocsPathUtils.makeDataTypePath(props.datatype?.namespace ?? "unknown", props.datatype),
                icon: props.slot_spec.is_input ? <InputIcon class="tag-icon" /> : <OutputIcon class="tag-icon" />
            }
        ];

        if (props.slot_spec.max_connections) {
            badge_list.push({ label: `max: ${props.slot_spec.max_connections}` });
        }
        return badge_list;
    });

    return (
        <DropdownSection
            id={DocsPathUtils.makeSlotSectionId(props.slot_id)}
            header_content={() => (
                <div class="fill keep row-container space-between">
                    <div class="docs-slot-header">
                        <SlotHeader slot_id={props.slot_id} slot_spec={props.slot_spec} />
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
                        <ParsedMetaText text={props.slot_meta.description} default="No Description"/>
                    </div>
                    <Show when={props.slot_spec.max_connections}>
                        <div class="text-section">
                            <h4>Max Connections: {props.slot_spec.max_connections}</h4>
                        </div>
                    </Show>
                </div>
            }
        />
    );
};

export const NodeSlotSection = (props: {
    data: NodeTypeMeta;
    spec: NodeTypeSpec;
    packageManager: PackageManager;
    devMode: boolean;
}) => {
    const slot_bundle = createMemo(() => {
        const meta = props.data.slot_meta;
        const bundles: Array<[NodeSlotSpec, SlotMeta, string]> = [];
        
        for (const [slot_id, slot_spec] of Object.entries(props.spec.slots)) {
            const slotMeta = meta[slot_id];
            if (slotMeta) bundles.push([slot_spec, slotMeta, slot_id]);
        }
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
                        {([slotSpec, slotMeta, slotId]) => {
                            const data_type = props.packageManager.registry.getDataTypeSpec(
                                slotSpec.datatype_fqn
                            )
                            return (
                                <SlotDropdownItem 
                                    datatype={data_type}
                                    slot_id={slotId} 
                                    slot_spec={slotSpec} 
                                    slot_meta={slotMeta} 
                                    devMode={props.devMode} 
                                />
                            )
                        }}
                    </For>
                </div>
            </Show>
        </div>
    );
};

const ParameterDropdownItem = (props: {
    param_id: string;
    param_spec: ParameterSpec;
    param_meta: ParameterMeta;
    devMode: boolean;
}) => {
    const badges = createMemo<DropdownBadge[]>(() => {
        const spec = props.param_spec;
        const list: DropdownBadge[] = [
            {
                label: spec.type,
                icon: <ToolIcon class="tag-icon" />
            }
        ];

        if (spec.default != undefined) {
            list.push({ label: `default: ${spec.default}` });
        }

        // TODO:
        // if ("step" in spec && spec.step != undefined) {
        //     list.push({ label: `step: ${spec.step}` });
        // }
        // if ("range" in spec.range != undefined) {
        //     list.push({ label: `range` });
        // }
        // if (spec.extension_filter != undefined) {
        //     if (spec.extension_filter.length > 0) list.push({ icon: <FilterIcon class="tag-icon"/>, label: "" });
        // }

        return list;
    });

    const formatValue = (val: any) => {
        return String(val);
    };

    return (
        <DropdownSection
            id={DocsPathUtils.makeParamSectionId(props.param_id)}
            header_content={() => (
                <div class="fill keep row-container space-between">
                    <div class="docs-slot-header">
                        <span>
                            {props.param_meta?.capitalized_name !== "" 
                                ? props.param_meta.capitalized_name 
                                : props.param_id}
                        </span>
                        <div class="docs-header-badges">
                            <For each={badges()}>{(badge) => <BadgeTag badge={badge} />}</For>
                        </div>
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
                            <DataTypeFieldSelector parameterId={props.param_id} parameterSpec={props.param_spec} hide_label={true} />
                        </div>
                    </div>

                    <div class="text-section">
                        <h4>Description</h4>
                        <ParsedMetaText text={props.param_meta.description} default="No Description"/>
                    </div>

                    <Show when={props.param_spec.default != undefined}>
                        <div class="text-section row">
                            <h4>Default Value:</h4>
                            <span>{formatValue(props.param_spec.default)}</span>
                        </div>
                    </Show>

                    {/* TODO: */}
                    {/* <Show when={props.param_data.step != undefined}>
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
                    </Show> */}
                </div>
            }
        />
    );
};

export const NodeParameterSection = (props: {
    data: NodeTypeMeta;
    spec: NodeTypeSpec;
    devMode: boolean;
}) => {
    const param_bundle = createMemo(() => {
        const meta = props.data.parameter_meta;
        const bundles: Array<[ParameterSpec, ParameterMeta, string]> = [];

        for (const [paramId, paramSpec] of Object.entries(props.spec.parameters)) {
            const paramMeta = meta[paramId];
            if (paramMeta) bundles.push([paramSpec, paramMeta, paramId]);

        }
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
                        {([paramSpec, paramMeta, paramId]) => (
                            <ParameterDropdownItem 
                                param_id={paramId} 
                                param_spec={paramSpec} 
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