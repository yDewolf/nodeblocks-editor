import { createMemo, createSignal, Match, Show, Switch } from "solid-js";
import { useDocs } from "~/editor/controllers/docs-controller";
import { EditorTool } from "~/editor/tools/base-tool";
import { DocsPath, DocsTags } from "./docs-components";
import CodeIcon from "~/assets/icons/code.svg";
import { DocPayload } from "~/network/controllers/docs/docs-interfaces";
import { NodeTypeMeta } from "~/wrapper/metadata/type_metadata";
import { NodePreview } from "../../editor/components/node/node-component";
import { SceneController } from "~/wrapper/controllers/scene-controller";

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
                        <p>{docs_data()?.data.description}</p>
                    </div>
                    <DocsContentSelector path={docs.currentDocsPath} docs_data={docs_data()} scene_controller={props.scene_controller}/>
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
    scene_controller: SceneController
}) => {
    if (!props.docs_data) return undefined;
    if (!props.path()) return undefined;
    
    return (
        <Switch fallback={
            <span>No implementation for documentation type {props.docs_data.type}</span>
        }>
            <Match when={props.docs_data.type === "node"}>
                <NodeDocsContent path={props.path} scene_controller={props.scene_controller} data={props.docs_data.type === "node" ? props.docs_data.data : undefined}/>            
            </Match>
        </Switch>
    )
}

const NodeDocsContent = (props: {
    path: () => string | undefined,
    data?: NodeTypeMeta,
    scene_controller: SceneController
}) => {
    if (!props.data) {
        return <span>Couldn't load documentation</span>
    }

    const preview = createMemo(() => {
        const path = props.path() ?? "";
        const type_id = path.split("/").at(-1);
        if (type_id) {
            const node_constructor = props.scene_controller.node_controller.node_constructors.get(type_id)
            if (node_constructor) {
                return <NodePreview constructor={node_constructor}/>
            }
        }
        return <span>Couldn't parse Node Preview</span>
    })
    return (
        <div class="keep fill container">
            <div class="container">
                <h3>Preview</h3>
                <div class="remove-input all">
                    {preview()}            
                </div>
            </div>
        </div>
    )
}