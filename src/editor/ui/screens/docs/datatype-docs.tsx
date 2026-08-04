import { createMemo, createResource, createSignal, Match, Switch } from "solid-js";
import { DocsPathSplitter } from "~/singletons/metadata";
import { SceneController } from "~/wrapper/controllers/scene-controller";
import { DataTypeMeta } from "~/wrapper/metadata/type_metadata";
import { OutputSelector } from '../../editor/components/node/output/node-output';
import { FieldValueDisplayer, SimpleField } from "../../components/input-fields";
import { DocsPathPrefix } from "~/network/controllers/docs/docs-interfaces";
import { BaseDataType, DataTypeUtils, DefaultRenderers } from "~/wrapper/nodes/data/node-data-type";
import { DataTypeGenParams, generate_datatype_random_value } from '../../../../wrapper/nodes/data/data-type-value-utils';
import RefreshIcon from '~/assets/icons/refresh.svg';
import { createStore } from "solid-js/store";

export const DataTypeDocsContent = (props: {
    path: () => string | undefined,
    data?: DataTypeMeta,
    scene_controller: SceneController,
    devMode: boolean
}) => {
    if (!props.data) {
        return <span>Couldn't load documentation</span>
    }
    
    const datatype = createMemo(() => {
        const path = props.path() ?? "";
        const type_id = path.split(DocsPathSplitter).at(-1);
        if (type_id) {
            if (props.data?.is_builtin) {
                return DataTypeUtils._match_default_data_type(type_id);
            }
            const datatype = props.scene_controller.node_type_reader.data_types.get(type_id);
            return datatype;
        }
        return undefined;
    });
    
    return (
        <div class="keep fill container docs-sections">
            <DataTypeAttributes meta={props.data} datatype={datatype()}/>
            <DataTypePreview meta={props.data} datatype={datatype()}/>
        </div>
    )
}

const DataTypeAttributes = (props: {
    meta: DataTypeMeta,
    datatype?: BaseDataType
}) => {
    // TODO: Mexer nisso aqui depois para não ficar repetitivo com os outros subcomponentes
    if (!props.datatype) {
        return <div class="text-section">
            <h3>Attributes</h3>
            <p>Couldn't find a DataType Object</p>
        </div>
    }

    return (
        <div class="text-section">
            <h3>Attributes</h3>
            <SimpleField field_name="Base" field_displayer={
                () => <a class="field-link" href={`#docs=${props.datatype?.root_id}${DocsPathSplitter}${DocsPathPrefix.DATATYPE}${DocsPathSplitter}${props.datatype?.base}`}><FieldValueDisplayer value_element={() => <input readonly value={props.datatype?.base} id={props.datatype?.type_id + "-base"}/>}/></a>
            } field_id={props.datatype?.type_id + "-base"}/>
            <SimpleField field_name="Renderer" field_displayer={
                () => <FieldValueDisplayer value_element={() => <input readonly value={props.datatype?.renderer} id={props.datatype?.type_id + "-renderer"}/>}/>
            } field_id={props.datatype?.type_id + "-renderer"}/>
        </div>
    )
}

const DataTypePreview = (props: {
    meta: DataTypeMeta,
    datatype?: BaseDataType
}) => {
    // TODO: Mexer nisso aqui depois para não ficar repetitivo com os outros subcomponentes
    if (!props.datatype) {
        return <div class="text-section">
            <h3>Output Preview</h3>
            <p>Couldn't find a DataType Object</p>
        </div>
    }
    
    const [fetch_signal, refetch] = createSignal(false);
    const [genParams, setGenParams] = createStore<DataTypeGenParams>({});
    const preview_value = createMemo(() => {
        fetch_signal()
        refetch(false);

        if (!props.datatype) return undefined;
        const value = generate_datatype_random_value(props.datatype, genParams)
        return value;
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
                    renderer={props.datatype?.renderer} 
                    params={genParams} 
                    setParams={setGenParams} 
                />
                <OutputSelector output_renderer={props.datatype?.renderer} output_value={preview_value()}/>
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