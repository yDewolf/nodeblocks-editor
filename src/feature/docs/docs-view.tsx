import { createMemo, createSignal, For, Match, onMount, ParentComponent, Show, Switch } from "solid-js";
import { useDocs } from "~/feature/docs/docs-context";
import { DocsPath, DocsTags } from "./components/docs-components";
import { DocPayload, InterfaceElementMeta } from "~/feature/docs/docs-protocols";
import CodeIcon from "~/assets/icons/code.svg";
import { NodeDocsContent } from "./components/content/node-docs";
import { InterfaceDocsContent } from './components/content/interface-docs';
import { DataTypeDocsContent } from "./components/content/datatype-docs";
import { HeaderDocsContent } from "./components/content/header-docs";
import AskDocsIcon from "~/assets/icons/ask-about.svg";
import { DynamicMetaProvider, MetaProvider } from "~/feature/metadata/metadata-context";
import { ParsedMetaText } from '../metadata/components/metadata-text';
import { DocsSidebar } from "~/feature/docs/components/docs-sidebar";
import { PackageManager } from '../editor/engine/packages/package-manager';
import { DataTypeMeta, NodeTypeMeta } from "~/protocols/nodeblocks/metadata/type_metadata";
import { MetadataHeader } from "~/protocols/nodeblocks/metadata/header_metadata";
import { usePackageManager } from "../editor/contexts/package-manager-context";

export const DocsView = () => {
    const docs = useDocs();
    const docs_data = createMemo(() => {
        if (!docs.docsData) {
            return;
        }

        if (docs.docsData.latest) {
            return docs.docsData.latest;
        }

        return undefined;
    })

    const [devMode, setDevMode] = createSignal(false);
    onMount(() => {
        docs.navigateToSection(docs.route);        
    })
    return (
        <MetaProvider value={{ metadata: docs.currentRoot}}>
            <div class="docs-view-body">
                <div class="docs-left-panel">
                    <DocsSidebar docs_data={docs_data()}/>
                </div>
                <div class="docs-content">
                    <div class="fill keep row-container space-between">
                        <DocsPath current_path={docs.docs_path} docs_data={docs_data()}/>                    
                        <button class="icon-button dev-mode-button" classList={{"active": devMode()}} onclick={() => setDevMode(!devMode())}>
                            <CodeIcon/>
                        </button>
                    </div>
                    <Show when={docs_data()} fallback={
                        <Show when={docs.docs_path} fallback={
                            <div class="text-section">
                                <h2>No documentation selected</h2>
                                <p>You can view documentation about datatypes, nodetypes and interface elements by:</p>
                                <ul>
                                    <li class="row-container center-items">
                                        selecting an element with the docs tool (<AskDocsIcon class="small-icon"/>)
                                    </li>
                                    <li class="row-container center-items">
                                        using the documentation index (left tab in this view)
                                    </li>
                                    <li class="row-container center-items">
                                        inserting #docs={"<path.to.documentation>"} in your browser's url
                                    </li>
                                </ul>
                            </div>
                        }>
                            <h2>Couldn't find documentation</h2>
                        </Show>
                    }>
                        {(data) => 
                            <DynamicMetaProvider payload={data()}>
                                <Show when={data()?.type != "header"}>
                                    <DocsTags docs_data={data()}/>
                                </Show>
                                <DefaultDocsContent docsData={data()}>
                                    <DocsContentSelector path={docs.docs_path} docs_data={data()} packageManager={usePackageManager()} devMode={devMode()}/>
                                </DefaultDocsContent>
                            </DynamicMetaProvider>
                        }
                    </Show>
                    <Show when={devMode()}>
                        <p>
                            {docs_data() ? JSON.stringify(docs_data()) : "No Documentation"}
                        </p>
                    </Show>
                </div>
            </div>
        </MetaProvider>
    )
}

const DefaultDocsContent: ParentComponent<{
    docsData: DocPayload
}> = (props) => {
    const usages: string[] = "usages" in props.docsData.data ? props.docsData.data.usages : [];
    return <>
        <div class="text-section">
            <h2>{(props.docsData?.data.capitalized_name)}</h2>
            <Show when={props.docsData?.data.brief}>
                {(brief) => {
                    <ParsedMetaText text={brief()}/>
                }}
            </Show>
        </div>
        <div class="text-section">
            <Show when={props.docsData?.data.brief}>
                <h2>Description</h2>
            </Show>
            <ParsedMetaText text={props.docsData?.data.description} default="No Description"/>
        </div>
        {props.children}
        <Show when={usages.length > 0}>
            <div class="text-section">
                <h2>Usages</h2>
                <For each={usages}>
                    {(usage) => <ParsedMetaText text={usage}/>}
                </For>
            </div>
        </Show>
    </>
}

const DocsContentSelector = (props: {
    path?: string,
    docs_data: DocPayload,
    packageManager: PackageManager,
    devMode: boolean
}) => {
    return <Switch fallback={
        <span>No implementation for documentation type {props.docs_data.type}</span>
    }>
        <Match when={props.docs_data.type === "header"}>
            <HeaderDocsContent path={props.path} data={props.docs_data.data as MetadataHeader} devMode={props.devMode}/>            
        </Match>
        <Match when={props.docs_data.type === "node"}>
            <NodeDocsContent path={props.path} data={props.docs_data.data as NodeTypeMeta} packageManager={props.packageManager} devMode={props.devMode}/>
        </Match>
        <Match when={props.docs_data.type === "interface"}>
            <InterfaceDocsContent path={props.path} data={props.docs_data.data as InterfaceElementMeta} devMode={props.devMode}/>            
        </Match>
        <Match when={props.docs_data.type === "datatype"}>
            <DataTypeDocsContent path={props.path} data={props.docs_data.data as DataTypeMeta} packageManager={props.packageManager} devMode={props.devMode}/>            
        </Match>
    </Switch>
}
