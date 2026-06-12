import { createMemo } from "solid-js";
import { useDocs } from "~/editor/controllers/docs-controller";
import { EditorTool } from "~/editor/tools/base-tool";

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
    return (
        <div>
            <span>
                {docs.currentDocsPath()}
            </span>
            <p>
                {docs_data() ? JSON.stringify(docs_data()) : ""}
            </p>
        </div>
    )
}