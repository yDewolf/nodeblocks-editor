import { createMemo, For } from "solid-js";
import { useDocs } from "~/editor/controllers/docs-controller";
import { EditorTool } from "~/editor/tools/base-tool";
import { NodeCategory, NodeTag } from "~/wrapper/metadata/node_filters";

type PathPart = {
    label: string,

}

function recursive_category_part(category: NodeCategory | string, path_parts: PathPart[]) {
    if (!category) {return;}
    if (typeof category === "string") {
        path_parts.push({label: category})
        return;
    }
    
    if (category.super_category) {
        recursive_category_part(category.super_category, path_parts);
    }

    if (category.category_id) {
        path_parts.push({label: category.category_id});
    }
}

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

    const path_parts = createMemo(() => {
        const path = docs.currentDocsPath();
        if (!path) {
            return [];
        }
        
        const path_split = path.split("/");
        if (path_split.length == 0) return [];
        
        let path_parts: PathPart[] = [{
            label: path_split[0]
        }];
        
        const data = docs_data();
        if (data?.type === "node") {
            const node_category = data.data.category;
            recursive_category_part(node_category, path_parts);            
        }

        path_split.forEach((part, idx) => {
            if (idx == 0) return;
            path_parts.push({label: part})
        });
        return path_parts;
    })

    return (
        <div class="docs-view-body">
            <div class="docs-left-panel">
                TODO
            </div>
            <div class="docs-content">
                <div class="keep fill row-container">
                    <For each={path_parts()}>
                        {(part, idx) => {
                            return (
                                <span>{part.label + (idx() < (path_parts()?.length ?? 1) - 1 ? " > " : "")}</span>
                            )
                        }}                        
                    </For>
                </div>
                <p>
                    {docs_data() ? JSON.stringify(docs_data()) : "No Documentation"}
                </p>
            </div>
        </div>
    )
}