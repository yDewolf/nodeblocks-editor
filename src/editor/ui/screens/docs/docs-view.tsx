import { createMemo, createSignal, For, JSXElement, Match, Show, Switch } from "solid-js";
import { useDocs } from "~/editor/controllers/docs-controller";
import { EditorTool } from "~/editor/tools/base-tool";
import { DocsPath, DocsTags } from "./docs-components";
import { DocPayload } from "~/network/controllers/docs/docs-interfaces";
import { SceneController } from "~/wrapper/controllers/scene-controller";
import CodeIcon from "~/assets/icons/code.svg";
import { NodeDocsContent } from "./node-docs";
import { InterfaceDocsContent } from "./interface-docs";
import { DataTypeDocsContent } from "./datatype-docs";

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
                <div class="fill keep row-container">
                    TODO
                </div>
            </div>
            <div class="docs-content">
                <Show when={docs_data()} fallback={
                    <h2>Couldn't find documentation</h2>
                }>
                    <div class="fill keep row-container space-between">
                        <DocsPath current_path={docs.currentDocsPath()} docs_data={docs_data()}/>                    
                        <button class="icon-button dev-mode-button" classList={{"active": devMode()}} onclick={() => setDevMode(!devMode())}>
                            <CodeIcon/>
                        </button>
                    </div>
                    <DocsTags docs_data={docs_data()}/>
                    <div class="text-section">
                        <h2>{docs_data()?.data.capitalized_name}</h2>
                        <p>{(docs_data()?.data.description) == "" || undefined ? "No Description" : (docs_data()?.data.description)}</p>
                    </div>
                    <DocsContentSelector path={docs.currentDocsPath} docs_data={docs_data()} scene_controller={props.scene_controller} devMode={devMode()}/>
                    <Show when={devMode()}>
                        <p>
                            {docs_data() ? JSON.stringify(docs_data()) : "No Documentation"}
                        </p>
                    </Show>
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
