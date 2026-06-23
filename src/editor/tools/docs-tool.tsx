import { GraphNode } from "~/wrapper/nodes/graph-node";
import { BaseEditorTool } from "./base-tool";
import { make_datatype_docs_path, make_node_docs_path, make_ui_docs_path } from "~/network/controllers/docs/docs-resolver";
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot";
import { NodeTypePreview } from "../ui/editor/subpanels/node-type-selector";
import { NodeEditor } from "../node-editor";
import { Vector2 } from "~/wrapper/data_types/geometry";
import { createSignal } from "solid-js";

export class DocsTool extends BaseEditorTool {
    protected _selected_docs_path: string | undefined = undefined;
    private lastHoveredElement: HTMLElement | null = null;
    public onSelectDocumentation?: () => void;

    protected _last_pos: () => Vector2 | undefined;
    protected _set_last_pos: (value: Vector2 | undefined) => void;

    constructor(node_editor: NodeEditor) {
        super(node_editor);
        const [lastPos, setLastPos] = createSignal<Vector2 | undefined>(undefined);
        this._last_pos = lastPos;

        this._set_last_pos = setLastPos;
    }

    get last_selected_pos() { return this._last_pos(); }

    protected set selected_docs_path(path: string | undefined) {
        const docs = this.node_editor.docs_controller;
        if (!docs) return;
        
        if (this._selected_docs_path != path) {
            this._selected_docs_path = path;
            docs.setCurrentDocsPath(this._selected_docs_path);
        }

        if (this._selected_docs_path) {
            this.onSelectDocumentation?.();
        }
    }
    
    globalOnPointerMove = (e: PointerEvent): void => {
        const docs = this.node_editor.docs_controller;
        if (!docs) return;
        
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
                docs.setHoveredDocElement(docs_element);
            }
        }
    }

    public clearElement = (): void => {
        const docs = this.node_editor.docs_controller;
        if (!docs) return;
        
        this.lastHoveredElement = null;
        docs.setHoveredDocElement(null);
    }

    globalOnPointerDown = (e: PointerEvent): void => {
        const docs = this.node_editor.docs_controller;
        if (!docs) return;
        // Select UI element docs path
        const clickedElement = e.target as HTMLElement;
        if (!clickedElement) return;
        
        let docs_element = clickedElement.closest("[docs-id], [has-docs]") as HTMLElement;
        if (docs_element) {
            docs.setSelectedDocElement(docs_element as HTMLElement);
            e.preventDefault();
            e.stopPropagation();

            const docs_id = docs_element.getAttribute("docs-id");
            if (docs_id) {
                this._set_last_pos({x: e.clientX, y: e.clientY});
                this.selected_docs_path = make_ui_docs_path(docs_id);
            }
        }
    }

    onClickOnNodeSlot(slot: NodeSlot): void {
        // Select DataType type id as path
        this.selected_docs_path = make_datatype_docs_path(undefined, slot)
        this._set_last_pos(undefined);
    }

    onClickOnNodePreview(node_preview: NodeTypePreview): void {
        this.selected_docs_path = make_node_docs_path(undefined, node_preview.node_constructor.type_id)    
        this._set_last_pos(undefined);
    }

    onClickOnNode(node: GraphNode): void {
        // Select Node type id as path
        this.selected_docs_path = make_node_docs_path(node);
        this._set_last_pos(undefined);
    }
}
