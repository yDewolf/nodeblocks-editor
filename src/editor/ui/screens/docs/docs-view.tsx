import { createMemo, createSignal, For, JSXElement, Match, Show, Switch } from "solid-js";
import { useDocs } from "~/editor/controllers/docs-controller";
import { EditorTool } from "~/editor/tools/base-tool";
import { DocsPath, DocsTags } from "./docs-components";
import { DocPayload } from "~/network/controllers/docs/docs-interfaces";
import { SceneController } from "~/wrapper/controllers/scene-controller";
import CodeIcon from "~/assets/icons/code.svg";
import { NodeDocsContent } from "./node-docs";
import { InterfaceDocsContent } from './interface-docs';
import { DataTypeDocsContent } from "./datatype-docs";
import { DropdownSection } from "../../components/panels/dropdown";
import { MetadataStoreData, PathPrefixMap } from "~/network/controllers/metadata/metadata_controller";
import { DocsPathPrefix } from '../../../../network/controllers/docs/docs-interfaces';
import { DocsPathSplitter } from "~/singletons/metadata";
import { BaseMetadata } from '../../../../wrapper/metadata/base_metadata';
import { HeaderDocsContent } from "./header-docs";

export const DocsView = (props: {current_tool?: EditorTool, scene_controller: SceneController}) => {
    const docs = useDocs();
    const docs_data = createMemo(() => {
        if (!docs.docsData) {
            return;
        }
        if (docs.docsData.latest) {
            return docs.docsData.latest;
        }

        return undefined
    })

    const [devMode, setDevMode] = createSignal(false);
    return (
        <div class="docs-view-body">
            <div class="docs-left-panel">
                <DocsSidebar docs_data={docs_data()}/>
            </div>
            <div class="docs-content">
                <div class="fill keep row-container space-between">
                    <DocsPath current_path={docs.currentDocsPath()} docs_data={docs_data()}/>                    
                    <button class="icon-button dev-mode-button" classList={{"active": devMode()}} onclick={() => setDevMode(!devMode())}>
                        <CodeIcon/>
                    </button>
                </div>
                <Show when={docs_data()} fallback={
                    <h2>Couldn't find documentation</h2>
                }>
                    <Show when={docs_data()?.type != "header"}>
                        <DocsTags docs_data={docs_data()}/>
                    </Show>
                    <div class="text-section">
                        <h2>{(docs_data()?.data.capitalized_name)}</h2>
                        <p>{(docs_data()?.data.description) == "" || undefined ? "No Description" : (docs_data()?.data.description)}</p>
                    </div>
                    <DocsContentSelector path={docs.currentDocsPath} docs_data={docs_data()} scene_controller={props.scene_controller} devMode={devMode()}/>
                </Show>
                <Show when={devMode()}>
                    <p>
                        {docs_data() ? JSON.stringify(docs_data()) : "No Documentation"}
                    </p>
                </Show>
            </div>
        </div>
    )
}

const DocsContentSelector = (props: {
    path: () => string | undefined,
    docs_data?: DocPayload,
    scene_controller: SceneController,
    devMode: boolean
}) => {
    if (!props.docs_data) return undefined;
    if (!props.path()) return undefined;
    
    return (
        <Switch fallback={
            <span>No implementation for documentation type {props.docs_data.type}</span>
        }>
            <Match when={props.docs_data.type === "header"}>
                <HeaderDocsContent path={props.path} scene_controller={props.scene_controller} data={props.docs_data.type === "header" ? props.docs_data.data : undefined} devMode={props.devMode}/>            
            </Match>
            <Match when={props.docs_data.type === "node"}>
                <NodeDocsContent path={props.path} scene_controller={props.scene_controller} data={props.docs_data.type === "node" ? props.docs_data.data : undefined} devMode={props.devMode}/>            
            </Match>
            <Match when={props.docs_data.type === "interface"}>
                <InterfaceDocsContent path={props.path} scene_controller={props.scene_controller} data={props.docs_data.type === "interface" ? props.docs_data.data : undefined} devMode={props.devMode}/>            
            </Match>
            <Match when={props.docs_data.type === "datatype"}>
                <DataTypeDocsContent path={props.path} scene_controller={props.scene_controller} data={props.docs_data.type === "datatype" ? props.docs_data.data : undefined} devMode={props.devMode}/>            
            </Match>
        </Switch>
    )
}


const make_docs_index = (docs_record: Record<string, MetadataStoreData>) => {
    const type_doc_ids: string[] = Object.keys(docs_record);
    let flattened_index: string[] = [];
    let index: Map<string, string> = new Map();
    type_doc_ids.forEach((id) => {
        const datatype_keys = Object.keys(docs_record[id].data_types ?? []);
        const nodetype_keys = Object.keys(docs_record[id].node_types ?? []);
        const interface_keys = Object.keys(docs_record[id].interface ?? []);
        flattened_index = [...flattened_index, ...datatype_keys, ...nodetype_keys, ...interface_keys];
    });
    
    return [flattened_index, index];
}
export const DocsSidebar = (props: {
    docs_data?: DocPayload
}) => {
    const docs = useDocs();
    const loaded_docs = createMemo(() => {
        return Object.keys(docs.allDocs);
    });
    return (
        <div class="scrollable fill keep container">
            <For each={loaded_docs()}>
                {(type_id, idx) => {
                    const data = docs.allDocs[type_id];
                    return (
                        <DropdownSection 
                            header={type_id}
                            header_class=""
                            content={
                                <TypeDocsContent type_id={type_id} data={data} root_id={type_id}/>
                            }
                        />
                    )
                }}
            </For>
        </div>
    )
}

// TODO: Move these elements to another file
export const TypeDocsContent = (props: {
    type_id: string,
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
        <a href={"#docs=" + props.root_id}>header</a>
        <MetadataStoreSubContent data={props.data.data_types} header="datatypes" docs_prefix={DocsPathPrefix.DATATYPE} root_id={props.root_id}/>
        <MetadataStoreSubContent data={props.data.node_types} header="nodetypes" docs_prefix={DocsPathPrefix.NODE} root_id={props.root_id}/>
        <MetadataStoreSubContent data={props.data.interface} header="interface" docs_prefix={DocsPathPrefix.UI} root_id={props.root_id}/>
    </div>
}

export const MetadataStoreSubContent = (props: {
    data?: Record<string, any>,
    header: string,
    docs_prefix: DocsPathPrefix,
    root_id: string
}) => {
    if (!props.data) {
        return undefined;
    }

    return (
        <Show when={props.data != undefined ? Object.keys(props.data).length != 0 : false}>
            <DropdownSection 
                header_content={() => <div class="fill keep row-container">{props.header}</div>}
                content={<div class="fill container">
                    <For each={Object.keys(props.data ?? [])}>
                        {(id) => {
                            if (!props.data) {
                                return undefined;
                            }
                            const type_data = props.data[id] as BaseMetadata;
                            const name = type_data.capitalized_name != "" ? type_data.capitalized_name : id;
                            return <a href={"#docs=" + props.root_id + DocsPathSplitter + props.docs_prefix + DocsPathSplitter + id}>{name}</a>
                        }}
                    </For>
                </div>}
            />
        </Show>
    )
}