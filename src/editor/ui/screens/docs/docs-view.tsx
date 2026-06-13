import { createMemo, createSignal, Show } from "solid-js";
import { useDocs } from "~/editor/controllers/docs-controller";
import { EditorTool } from "~/editor/tools/base-tool";
import { DocsPath, DocsTags } from "./docs-components";
import CodeIcon from "~/assets/icons/code.svg";

export const DocsView = (props: {current_tool?: EditorTool}) => {
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
                    <h2>{docs_data()?.data.capitalized_name}</h2>
                    <p>{docs_data()?.data.description}</p>
                    
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
