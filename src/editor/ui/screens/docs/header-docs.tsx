import { SceneController } from "~/wrapper/controllers/scene-controller"
import { MetadataHeader } from "~/wrapper/metadata/header_metadata"
import { DocsTags, MetadataStoreSubContent } from "./docs-components"
import { SimpleField, FieldValueDisplayer } from "../../components/input-fields"
import { unixToDate } from "~/editor/utils/time-utils"
import { createMemo } from "solid-js"
import { useDocs } from "~/editor/controllers/docs-controller"
import { DocsPathPrefix } from "~/network/controllers/docs/docs-interfaces"
import { MetadataContentIndex } from "./docs-sidebar"

export const HeaderDocsContent = (props: {
    path: string | undefined,
    data?: MetadataHeader,
    scene_controller: SceneController,
    devMode: boolean
}) => {
    if (!props.data) {
        return <span>Couldn't load documentation</span>
    }
    const docs = useDocs();
    const metadata = createMemo(() => {
        if (!props.data) {
            throw new Error("Trying to access metadata that doesn't exist");
        }
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
                <SimpleField field_name="meta_version" field_displayer={
                    () => <FieldValueDisplayer value_element={() => <input readonly value={props.data?.meta_version} id={props.data?.types_id + "-meta_version"}/>}/>
                } field_id={props.data?.types_id + "-meta_version"}/>
                <SimpleField field_name="last_modified" field_displayer={
                    () => <FieldValueDisplayer value_element={() => <input readonly value={unixToDate(props.data?.last_modified ?? 0)} id={props.data?.types_id + "-last_modified"}/>}/>
                } field_id={props.data?.types_id + "-last_modified"}/>
            </div>
            <DocsTags section_title="All tags" docs_data={{type: "header", data: props.data}}/>
            <div class="text-section">
                <h3>Index</h3>
                <MetadataContentIndex data={metadata()} root_id={props.data.types_id}/>
            </div>
        </div>
    )
}