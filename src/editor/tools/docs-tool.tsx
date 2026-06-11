import { GraphNode } from "~/wrapper/nodes/graph-node";
import { BaseEditorTool } from "./base-tool";
import { make_datatype_docs_path, make_node_docs_path, make_ui_docs_path } from "~/network/controllers/docs/docs-resolver";
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot";
import { setCurrentDocsPath, setHoveredDocElement, setSelectedDocElement } from "~/singletons/docs";
import { NodeTypePreview } from "../ui/editor/subpanels/node-type-selector";

export class DocsTool extends BaseEditorTool {
    protected _selected_docs_path: string | undefined = undefined;
    private lastHoveredElement: HTMLElement | null = null;

    protected set selected_docs_path(path: string | undefined) {
        if (this._selected_docs_path != path) {
            this._selected_docs_path = path;
            setCurrentDocsPath(this._selected_docs_path);
        }
        console.log(path);
    }
    
    globalOnPointerMove(e: PointerEvent): void {
        const currentTarget = e.target as HTMLElement;
        if (!currentTarget) {
            this.clearElement();
            return;
        }

        let docs_element = currentTarget.closest("[docs-id], [has-docs]") as HTMLElement;
        if (docs_element !== this.lastHoveredElement) {
            this.clearElement();

            if (docs_element) {
                this.lastHoveredElement = docs_element;
                setHoveredDocElement(docs_element);
            }
        }
    }

    public clearElement(): void {
        this.lastHoveredElement = null;
        setHoveredDocElement(null);
    }

    globalOnPointerDown(e: PointerEvent): void {
        // Select UI element docs path
        const clickedElement = e.target as HTMLElement;
        if (!clickedElement) return;
        
        let docs_element = clickedElement.closest("[docs-id], [has-docs]") as HTMLElement;
        if (docs_element) {
            setSelectedDocElement(docs_element as HTMLElement);
            e.preventDefault();
            e.stopPropagation();

            const docs_id = docs_element.getAttribute("docs-id");
            if (docs_id) {
                this.selected_docs_path = make_ui_docs_path(docs_id);
            }
        }
    }

    onClickOnNodeSlot(slot: NodeSlot): void {
        // Select DataType type id as path
        this.selected_docs_path = make_datatype_docs_path(undefined, slot)
    }

    onClickOnNodePreview(node_preview: NodeTypePreview): void {
        this.selected_docs_path = make_node_docs_path(undefined, node_preview.node_constructor.type_id)    
    }

    onClickOnNode(node: GraphNode): void {
        // Select Node type id as path
        this.selected_docs_path = make_node_docs_path(node);
    }
}
