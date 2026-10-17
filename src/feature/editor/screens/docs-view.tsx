import { createMemo, createSignal, Match, Show, Switch } from "solid-js";
import { useDocs } from "~/feature/docs/docs-context";
import { DocsPath, DocsTags } from "../../docs/components/docs-components";
import { DocPayload } from "~/feature/docs/docs-protocols";
import CodeIcon from "~/assets/icons/code.svg";
import { NodeDocsContent } from "../../docs/components/content/node-docs";
import { InterfaceDocsContent } from '../../docs/components/content/interface-docs';
import { DataTypeDocsContent } from "../../docs/components/content/datatype-docs";
import { HeaderDocsContent } from "../../docs/components/content/header-docs";
import AskDocsIcon from "~/assets/icons/ask-about.svg";
import { DynamicMetaProvider, MetaProvider } from "~/feature/metadata/metadata-context";
import { ParsedMetaText } from '../../metadata/components/metadata-text';
import { DocsSidebar } from "~/feature/docs/components/docs-sidebar";
import { EditorTool } from "../tools/base-tool";
import { PackageManager } from '../engine/packages/package-manager';
import { useEditor } from "~/feature/scene-editor-context";

export const EditorDocsView = () => {
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
                        <DynamicMetaProvider payload={docs_data()}>
                            <Show when={docs_data()?.type != "header"}>
                                <DocsTags docs_data={docs_data()}/>
                            </Show>
                            <div class="text-section">
                                <h2>{(docs_data()?.data.capitalized_name)}</h2>
                                <ParsedMetaText text={docs_data()?.data.description} default="No Description"/>
                            </div>
                            <DocsContentSelector path={docs.docs_path} docs_data={docs_data()} packageManager={useEditor().packageManager} devMode={devMode()}/>
                        </DynamicMetaProvider>
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

const DocsContentSelector = (props: {
    path: string | undefined,
    docs_data?: DocPayload,
    packageManager: PackageManager,
    devMode: boolean
}) => {
    if (!props.docs_data) return undefined;
    if (!props.path) return undefined;
    
    return (
        <Switch fallback={
            <span>No implementation for documentation type {props.docs_data.type}</span>
        }>
            <Match when={props.docs_data.type === "header"}>
                <HeaderDocsContent path={props.path} data={props.docs_data.type === "header" ? props.docs_data.data : undefined} devMode={props.devMode}/>            
            </Match>
            <Match when={props.docs_data.type === "node"}>
                <NodeDocsContent path={props.path} data={props.docs_data.type === "node" ? props.docs_data.data : undefined} packageManager={props.packageManager} devMode={props.devMode}/>            
            </Match>
            <Match when={props.docs_data.type === "interface"}>
                <InterfaceDocsContent path={props.path} data={props.docs_data.type === "interface" ? props.docs_data.data : undefined} devMode={props.devMode}/>            
            </Match>
            <Match when={props.docs_data.type === "datatype"}>
                <DataTypeDocsContent path={props.path} data={props.docs_data.type === "datatype" ? props.docs_data.data : undefined} packageManager={props.packageManager} devMode={props.devMode}/>            
            </Match>
        </Switch>
    )
}
