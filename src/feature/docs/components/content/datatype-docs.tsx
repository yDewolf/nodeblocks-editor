import { createMemo, createSignal, Match, Show, Switch } from "solid-js";
import { DataTypeValuePack, DataTypeValueSelector } from "~/feature/scene/components/value/datatype-value-view";
import { FieldValueDisplayer, SimpleField } from "../../../../components/input-fields";
import RefreshIcon from '~/assets/icons/refresh.svg';
import { createStore } from "solid-js/store";
import { DocsHref } from "../docs-reference";
import { DataTypeMetaProvider, useDataTypeMetaContext } from "~/feature/metadata/metadata-context";
import { DocsPathUtils } from "~/feature/docs/helpers/docs-path-utils";
import { DataTypeMeta } from "~/protocols/nodeblocks/metadata/type_metadata";
import { PackageManager } from "~/feature/editor/engine/packages/package-manager";
import { NamespaceUtils } from "~/protocols/nodeblocks/namespace-model";
import { DataTypeSpec } from "~/protocols/nodeblocks/manifests/node/datatype-spec";
import { DataTypeGenParams, generate_datatype_random_value } from "~/feature/editor/utils/data-type-value-utils";
import { DefaultRenderers } from "~/protocols/nodeblocks/manifests/node/datatype-enums";
import { ExampleNodeSlotDot, makeSlotStyleFromDataTypeStyle } from '../../../scene/components/node/slot-components';

export const DataTypeDocsContent = (props: {
    path?: string,
    data: DataTypeMeta,
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
        if (!props.packageManager.registry.isDataTypeRegistered(fqn)) {
            return undefined;
        }
        const spec = props.packageManager.registry.getDataTypeSpec(fqn);
        return spec;
    });

    return (
        <DataTypeMetaProvider value={props.data}>
            <Show when={spec()} fallback={
                <div class="text-section">
                    <p>Couldn't find a DataType Object</p>
                </div>
            }>
                {(dataTypeSpec) => 
                    <div class="keep fill container docs-sections">
                        <DataTypeStyle meta={props.data}/>
                        <DataTypeAttributes meta={props.data} spec={dataTypeSpec()}/>
                        <DataTypePreview meta={props.data} spec={dataTypeSpec()}/>
                    </div>
                }
            </Show>
        </DataTypeMetaProvider>
    )
}

const DataTypeAttributes = (props: {
    meta: DataTypeMeta,
    spec: DataTypeSpec
}) => {
    // TODO: arrumar essa referência do base id
    const base_id = (props.spec ? props.spec.base_id as string : undefined) ?? "unknown";
    return (
        <div class="text-section">
            <h3>Attributes</h3>
            <SimpleField field_name="Base" field_displayer={
                // TODO: maybe add a better visual for field links
                () => <DocsHref class="field-link" route={{path: DocsPathUtils.makeDataTypePath("core", undefined, base_id)}}><FieldValueDisplayer value_element={() => <input readonly value={props.spec?.base_id} id={props.spec?.id + "-base"}/>}/></DocsHref>
            } field_id={props.spec?.id + "-base"}/>
            <SimpleField field_name="Renderer" field_displayer={
                () => <FieldValueDisplayer value_element={() => <input readonly value={props.spec?.default_renderer} id={props.spec?.id + "-renderer"}/>}/>
            } field_id={props.spec?.id + "-renderer"}/>
        </div>
    )
}

const DataTypePreview = (props: {
    meta: DataTypeMeta,
    spec: DataTypeSpec
}) => {
    const [fetch_signal, refetch] = createSignal(false);
    const [genParams, setGenParams] = createStore<DataTypeGenParams>({});
    const preview_value = createMemo(() => {
        fetch_signal()
        refetch(false);

        if (!props.spec) return undefined;
        if (!props.spec.base_id) return undefined;

        const [type, value] = generate_datatype_random_value(props.spec, genParams);
        const pack: DataTypeValuePack = {
            value: value,
            renderer: props.spec.default_renderer,
            font_id: props.spec.fqn,
            base_type: props.spec.base_id
        }
        return pack;
    });

    return (
        <div class="text-section">
            <div class="row-container">
                <h3>Output Preview</h3>
                <button class="icon-button" onclick={() => refetch(true)}>
                    <RefreshIcon class="dropdown-icon"/>
                </button>
            </div>

            <div class="container fill">
                <GenParamsEditor 
                    renderer={props.spec?.default_renderer} 
                    params={genParams} 
                    setParams={setGenParams} 
                />
                <DataTypeValueSelector value={preview_value()}/>
            </div>
        </div>
    )
}

export const GenParamsEditor = (props: {
    renderer: DefaultRenderers | undefined;
    params: DataTypeGenParams;
    setParams: (updater: (prev: DataTypeGenParams) => DataTypeGenParams) => void;
}) => {
    const id = ""
    return (
        <div class="fill container">
            <Switch fallback={
                <span>No parameters available for this renderer</span>
            }>
                <Match when={props.renderer === DefaultRenderers.SCALAR}>
                    <div class="fill container">
                        <div class="field-holder">
                            <SimpleField field_name="Min" field_displayer={
                                () => <FieldValueDisplayer value_element={() => <input 
                                    class="fill"
                                    type="number" 
                                    value={props.params.scalar?.value_range?.min ?? ""} 
                                    oninput={(e) => props.setParams(p => ({
                                        ...p,
                                        scalar: { value_range: { ...p.scalar?.value_range, min: e.target.value === "" ? undefined : Number(e.target.value) } }
                                    }))}
                                    id={id + "-min"}/>}/>
                            } field_id={id + "-min"}/>
                        </div>
                        <div class="field-holder">
                            <SimpleField field_name="Max" field_displayer={
                                () => <FieldValueDisplayer value_element={() => <input 
                                    class="fill"
                                    type="number" 
                                    value={props.params.scalar?.value_range?.max ?? ""} 
                                    oninput={(e) => props.setParams(p => ({
                                        ...p,
                                        scalar: { value_range: { ...p.scalar?.value_range, max: e.target.value === "" ? undefined : Number(e.target.value) } }
                                    }))}
                                    id={id + "-max"}/>}/>
                            } field_id={id + "-max"}/>
                        </div>
                    </div>
                </Match>
                <Match when={props.renderer === DefaultRenderers.ARRAY}>
                    <div class="row-container fill">
                        <div class="fill container">
                            <div class="field-holder">
                                <SimpleField field_name="Shape" field_displayer={
                                    () => <FieldValueDisplayer value_element={() => <input 
                                        type="text"
                                        placeholder="example: 10,10,3"
                                        oninput={(e) => {
                                            const val = e.target.value;
                                            const parsedShape = val ? val.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n > 0) : [];
                                            props.setParams(p => ({
                                                ...p,
                                                array: { ...p.array, shape: parsedShape }
                                            }));
                                        }}
                                        id={id + "shape"}/>}/>
                                } field_id={id + "shape"}/>
                            </div>
                        </div>
                        <div class="keep row-container">
                            <div class="field-holder">
                                <SimpleField field_name="Min" field_displayer={
                                    () => <FieldValueDisplayer value_element={() => <input 
                                        type="number"
                                        oninput={(e) => props.setParams(p => ({
                                            ...p,
                                            array: { ...p.array, value_range: { ...p.array?.value_range, min: e.target.value === "" ? undefined : Number(e.target.value) } }
                                        }))}
                                        id={id + "min"}/>}/>
                                } field_id={id + "min"}/>
                            </div>
                            <div class="field-holder">
                                <SimpleField field_name="Max" field_displayer={
                                    () => <FieldValueDisplayer value_element={() => <input 
                                        type="number"
                                        oninput={(e) => props.setParams(p => ({
                                            ...p,
                                            array: { ...p.array, value_range: { ...p.array?.value_range, min: e.target.value === "" ? undefined : Number(e.target.value) } }
                                        }))}
                                        id={id + "max"}/>}/>
                                } field_id={id + "max"}/>
                            </div>
                        </div>
                    </div>
                </Match>

                <Match when={props.renderer === DefaultRenderers.TEXT}>
                    <div class="field-holder">
                        <SimpleField field_name="SampleText" field_displayer={
                            () => <FieldValueDisplayer value_element={() => <input 
                                class="fill"
                                type="text"
                                onInput={(e) => props.setParams(p => ({
                                    ...p,
                                    text: { text: e.target.value || undefined }
                                }))}
                                id={id + "text"}/>}/>
                        } field_id={id + "text"}/>
                    </div>
                </Match>
            </Switch>
        </div>
    );
};


const DataTypeStyle = (props: {
    meta?: DataTypeMeta
}) => {
    return (
        <div class="text-section">
            <h3>Color Scheme</h3>
            <table class="datatype-style-table">
                <thead>
                    <tr>
                        <th>Input</th>
                        <th>Output</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <Show when={props.meta?.inStyle}
                                fallback={
                                    "Undefined"
                                }
                            >
                                {(style) => <ExampleNodeSlotDot isInput={true} slotStyle={
                                    makeSlotStyleFromDataTypeStyle(style())
                                }/>}
                            </Show>
                        </td>
                        <td>
                            <Show when={props.meta?.outStyle}
                                fallback={
                                    "Undefined"
                                }
                            >
                                {(style) => <ExampleNodeSlotDot isInput={false} slotStyle={
                                    makeSlotStyleFromDataTypeStyle(style())
                                }/>}
                            </Show>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}