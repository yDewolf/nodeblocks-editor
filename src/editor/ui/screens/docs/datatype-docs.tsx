import { createMemo } from "solid-js";
import { DocsPathSplitter } from "~/singletons/metadata";
import { SceneController } from "~/wrapper/controllers/scene-controller";
import { DataTypeMeta } from "~/wrapper/metadata/type_metadata";
import { OutputSelector } from '../../editor/components/node/output/node-output';
import { FieldValueDisplayer, SimpleField } from "../../components/input-fields";
import { DocsPath } from "~/network/controllers/docs/docs-interfaces";
import { BaseDataType, DataTypeUtils } from "~/wrapper/nodes/data/node-data-type";

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
    
    const preview_value = createMemo(() => {
        // TODO: Adicionar uma função helper que gera um output aleatório para o DataType específico
        return undefined;
    });

    return (
        <div class="keep fill container docs-sections">
            <div class="text-section">
                <h3>Output Preview</h3>
                <div>
                    <OutputSelector output_renderer={datatype()?.renderer} output_value={preview_value()}/>
                </div>
            </div>
            <DataTypeAttributes meta={props.data} datatype={datatype()}/>
        </div>
    )
}

const DataTypeAttributes = (props: {
    meta: DataTypeMeta,
    datatype?: BaseDataType
}) => {
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
                () => <a href={`#docs=${DocsPath.DATATYPE}${DocsPathSplitter}${props.datatype?.base}`}><FieldValueDisplayer value_element={() => <input readonly value={props.datatype?.base} id={props.datatype?.type_id + "-base"}/>}/></a>
            } field_id={props.datatype?.type_id + "-base"}/>
            <SimpleField field_name="Renderer" field_displayer={
                () => <FieldValueDisplayer value_element={() => <input readonly value={props.datatype?.renderer} id={props.datatype?.type_id + "-renderer"}/>}/>
            } field_id={props.datatype?.type_id + "-renderer"}/>
        </div>
    )
}