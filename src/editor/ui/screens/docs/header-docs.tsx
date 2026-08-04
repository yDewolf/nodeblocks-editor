import { SceneController } from "~/wrapper/controllers/scene-controller"
import { MetadataHeader } from "~/wrapper/metadata/header_metadata"
import { DocsTags } from "./docs-components"
import { SimpleField, FieldValueDisplayer } from "../../components/input-fields"
import { unixToDate } from "~/editor/utils/time-utils"
import { createMemo, For } from "solid-js"
import { DropdownSection } from '../../components/panels/dropdown';
import { useDocs } from "~/editor/controllers/docs-controller"
import { MetadataStoreSubContent } from './docs-view';
import { DocsPathPrefix } from "~/network/controllers/docs/docs-interfaces"

export const HeaderDocsContent = (props: {
    path: () => string | undefined,
    data?: MetadataHeader,
    scene_controller: SceneController,
    devMode: boolean
}) => {
    if (!props.data) {
        return <span>Couldn't load documentation</span>
    }
    const docs = useDocs();
    const metadata = createMemo(() => {
        if (!props.data) {return undefined;}
        return docs.allDocs[props.data?.types_id];
    });

    return (
        <div class="keep fill container docs-sections">
            <div class="text-section">
                <h3>Info</h3>
                <SimpleField field_name="id" field_displayer={
                    () => <FieldValueDisplayer value_element={() => <input readonly value={props.data?.types_id} id={props.data?.types_id + "-id"}/>}/>
                } field_id={props.data?.types_id + "-id"}/>
                <SimpleField field_name="version" field_displayer={
                    () => <FieldValueDisplayer value_element={() => <input readonly value={props.data?.types_version} id={props.data?.types_id + "-version"}/>}/>
                } field_id={props.data?.types_id + "-version"}/>
                <SimpleField field_name="last_modified" field_displayer={
                    () => <FieldValueDisplayer value_element={() => <input readonly value={unixToDate(props.data?.last_modified ?? 0)} id={props.data?.types_id + "-last_modified"}/>}/>
                } field_id={props.data?.types_id + "-last_modified"}/>
            </div>
            <DocsTags section_title="All tags" docs_data={{type: "header", data: props.data}}/>
            <div class="text-section">
                <h3>Index</h3>
                <MetadataStoreSubContent data={metadata()?.data_types} header="datatypes" docs_prefix={DocsPathPrefix.DATATYPE} root_id={props.data.types_id}/>
                <MetadataStoreSubContent data={metadata()?.node_types} header="nodetypes" docs_prefix={DocsPathPrefix.NODE} root_id={props.data.types_id}/>
                <MetadataStoreSubContent data={metadata()?.interface} header="interface" docs_prefix={DocsPathPrefix.UI} root_id={props.data.types_id}/>
            </div>
        </div>
    )
}