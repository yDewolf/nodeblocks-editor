import { GraphNode } from "~/wrapper/nodes/graph-node";
import { BaseEditorTool } from "./base-tool";
import { make_datatype_docs_path, make_node_docs_path, make_ui_docs_path } from "~/network/controllers/docs/docs-resolver";
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot";
import { setCurrentDocsPath } from "~/singletons/docs";

export class DocsTool extends BaseEditorTool {
    protected _selected_docs_path: string | undefined = undefined;
    

    protected set selected_docs_path(path: string | undefined) {
        if (this._selected_docs_path != path) {
            this._selected_docs_path = path;
            setCurrentDocsPath(this._selected_docs_path);
        }
        console.log(path);
    }
    
    globalOnPointerDown(e: PointerEvent): void {
        // Select UI element docs path
        const clickedElement = e.target as HTMLElement;
        if (!clickedElement) return;
        
        const docsElement = clickedElement.closest("[docs-id]");
        if (docsElement) {
            e.preventDefault();
            e.stopPropagation();
            const docs_id = docsElement.getAttribute("docs-id");
            
            if (docs_id) {
                this.selected_docs_path = make_ui_docs_path(docs_id);
            }
        }
    }

    onClickOnNodeSlot(slot: NodeSlot): void {
        // Select DataType type id as path
        this.selected_docs_path = make_datatype_docs_path(undefined, slot)
    }

    onClickOnNode(node: GraphNode): void {
        // Select Node type id as path
        this.selected_docs_path = make_node_docs_path(node);
    }
}
