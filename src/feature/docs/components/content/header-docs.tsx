import { MetadataHeader } from "~/protocols/nodeblocks/metadata/header_metadata";
import { useDocs } from "../../docs-context";
import { createMemo } from "solid-js";
import { SimpleField, FieldValueDisplayer } from "~/components/input-fields";
import { unixToDate } from "~/utils/time-utils";
import { DocsTags } from "../docs-components";
import { MetadataContentIndex } from "../docs-sidebar";

export const HeaderDocsContent = (props: {
    path: string | undefined,
    data?: MetadataHeader,
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
        return docs.allDocs[props.data?.package_id];
    });

    return (
        <div class="keep fill container docs-sections">
            <div class="text-section">
                <h3>Info</h3>
                <SimpleField field_name="id" field_displayer={
                    () => <FieldValueDisplayer value_element={() => <input readonly value={props.data?.package_id} id={props.data?.package_id + "-id"}/>}/>
                } field_id={props.data?.package_id + "-id"}/>
                <SimpleField field_name="version" field_displayer={
                    () => <FieldValueDisplayer value_element={() => <input readonly value={props.data?.package_version} id={props.data?.package_id + "-version"}/>}/>
                } field_id={props.data?.package_id + "-version"}/>
                <SimpleField field_name="meta_version" field_displayer={
                    () => <FieldValueDisplayer value_element={() => <input readonly value={props.data?.meta_version} id={props.data?.package_id + "-meta_version"}/>}/>
                } field_id={props.data?.package_id + "-meta_version"}/>
                <SimpleField field_name="last_modified" field_displayer={
                    () => <FieldValueDisplayer value_element={() => <input readonly value={unixToDate(props.data?.last_modified ?? 0)} id={props.data?.package_id + "-last_modified"}/>}/>
                } field_id={props.data?.package_id + "-last_modified"}/>
            </div>
            <DocsTags section_title="All tags" docs_data={{type: "header", data: props.data}}/>
            <div class="text-section">
                <h3>Index</h3>
                <MetadataContentIndex data={metadata()} root_id={props.data.package_id}/>
            </div>
        </div>
    )
}