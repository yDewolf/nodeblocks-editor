import { createMemo, For } from "solid-js";
import { useDocs } from "~/editor/controllers/docs-controller";
import { DocPayload, DocsPathPrefix } from "~/network/controllers/docs/docs-interfaces";
import { MetadataStoreData } from "~/network/controllers/metadata/metadata_controller";
import { DropdownSection } from "../../components/panels/dropdown";
import { MetadataStoreSubContent } from "./docs-components";

export const DocsSidebar = (props: {
    docs_data?: DocPayload
}) => {
    const docs = useDocs();
    const loaded_docs = createMemo(() => {
        return Object.keys(docs.allDocs);
    });
    return (
        <div class="docs-sidebar">
            <div class="scrollable fill keep container">
                <For each={loaded_docs()}>
                    {(type_id, idx) => {
                        const data = docs.allDocs[type_id];
                        return (
                            <DropdownSection 
                                dropdown_class="list"
                                header={type_id}
                                header_class=""
                                content={
                                    <MetadataContentIndex data={data} root_id={type_id}/>
                                }
                            />
                        )
                    }}
                </For>
            </div>
            <div class="scrollable keep fill container">
                <For each={docs.docs_history.reverse()}>
                    {(path: string) => {
                        return (
                            // TODO: Format this properly so root and other stuff appears only if needed 
                            <a class="docs-href" href={"#docs=" + path}>{path}</a>
                        )
                    }}
                </For>
            </div>
        </div>
    )
}

export const MetadataContentIndex = (props: {
    root_id: string,
    data: MetadataStoreData
}) => {
    return <div class="fill container">
        {/* Procedural way of generating these dropdowns */}
        {/* <For each={Object.keys(props.data)}>
            {(key: string) => {
                return (
                    <TypeSubgroup data={(props.data as Record<string, any>)[key]} header={key} docs_prefix={PathPrefixMap[key]} root_id={props.root_id}/>
                )
            }}
        </For> */}

        {/* TODO: implement header metadata linking stuff */}
        <a class="docs-href" href={"#docs=" + props.root_id}>header</a>
        <MetadataStoreSubContent data={props.data.data_types} header="datatypes" docs_prefix={DocsPathPrefix.DATATYPE} root_id={props.root_id}/>
        <MetadataStoreSubContent data={props.data.node_types} header="nodetypes" docs_prefix={DocsPathPrefix.NODE} root_id={props.root_id}/>
        <MetadataStoreSubContent data={props.data.interface} header="interface" docs_prefix={DocsPathPrefix.UI} root_id={props.root_id}/>
    </div>
}
