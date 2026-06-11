import { createMemo } from "solid-js";
import { EditorTool } from "~/editor/tools/base-tool";
import { currentDocsPath, docData } from "~/singletons/docs";
import { DocPayload } from '../../../network/controllers/docs/docs-interfaces';

export const DocsView = (props: {current_tool?: EditorTool}) => {
    const docs_data = createMemo(() => {
        if (docData.latest) {
            return docData.latest;
        }

        return undefined
    })
    return (
        <div>
            <span>
                {currentDocsPath()}
            </span>
            <p>
                {docs_data() ? JSON.stringify(docs_data()) : ""}
            </p>
        </div>
    )
}