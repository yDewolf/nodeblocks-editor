import { BaseEditorTool } from "./base-tool";
import { Vector2 } from "~/protocols/nodeblocks/geometry";
import { createSignal } from "solid-js";
import { DocsPathUtils } from "~/feature/docs/helpers/docs-path-utils";
import { DocsController } from "~/feature/docs/docs-controller";
import { SceneNodeSlot } from "~/feature/scene/objects/scene-slot";
import { NodeTypePreview } from "../components/subpanels/component/node-type-selector";
import { SceneNode } from "~/feature/scene/objects/scene-node";
import { DocsPathPrefix } from "~/feature/docs/docs-protocols";
import { NamespaceUtils } from "~/protocols/nodeblocks/namespace-model";

export class DocsTool extends BaseEditorTool {
    protected _selected_docs_path: string | undefined = undefined;
    private lastHoveredElement: HTMLElement | null = null;
    public onSelectDocumentation?: () => void;

    protected _last_pos: () => Vector2 | undefined;
    protected _set_last_pos: (value: Vector2 | undefined) => void;

    constructor(
        private readonly docsController: DocsController
    ) {
        super();
        [this._last_pos, this._set_last_pos] = createSignal<Vector2 | undefined>(undefined);
    }

    get last_selected_pos() { return this._last_pos(); }

    protected set selected_docs_path(path: string | undefined) {
        if (this._selected_docs_path != path) {
            this._selected_docs_path = path;
            this.docsController.docs_path = this._selected_docs_path;
        }
    }

    protected set selectedDocsSection(section: string | undefined) {
        if (this.docsController.docs_section != section) {
            this.docsController.docs_section = section;
        }
    }
    
    globalOnPointerMove = (e: PointerEvent): void => {
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
                this.docsController.setHoveredDocElement(docs_element);
            }
        }
    }

    public clearElement = (): void => {
        this.lastHoveredElement = null;
        this.docsController.setHoveredDocElement(null);
    }

    globalOnPointerDown = (e: PointerEvent): void => {
        // Select UI element docs path
        const clickedElement = e.target as HTMLElement;
        if (!clickedElement) return;

        if (clickedElement.parentElement instanceof HTMLButtonElement || clickedElement instanceof HTMLButtonElement) {
            return;
        }
        
        let docs_element = clickedElement.closest("[docs-id], [has-docs]") as HTMLElement;
        if (docs_element) {
            this.docsController.setSelectedDocElement(docs_element as HTMLElement);
            e.preventDefault();
            e.stopPropagation();

            const prefix = docs_element.getAttribute("docs-prefix") as DocsPathPrefix;
            
            const docs_section = docs_element.getAttribute("docs-section");
            const docs_id = docs_element.getAttribute("docs-id");
            const root_id = docs_element.getAttribute("docs-root");

            if (docs_id && root_id) {
                this._set_last_pos({x: e.clientX, y: e.clientY});
                this.selected_docs_path = DocsPathUtils.makeAutoPath(root_id, prefix ?? DocsPathPrefix.UI, docs_id);
                this.selectedDocsSection = docs_section ?? undefined;                
                if (this.selected_docs_path) { 
                    this.onSelectDocumentation?.();
                }
            }
        }
    }

    onClickOnNodeSlot(slot: SceneNodeSlot): void {
        // Select DataType type id as path
        // TODO: talvez ao invés de redirecionar para o datatype, a gente redireciona para o slot do node
        const fqn = slot.instance.spec.datatype_fqn;
        const [namespace, id] = NamespaceUtils.splitFqn(fqn);
        this.selected_docs_path = DocsPathUtils.makeDataTypePath(namespace, undefined, id);

        this._set_last_pos(undefined);
    }

    onClickOnNodePreview(node_preview: NodeTypePreview): void {
        this.selected_docs_path = DocsPathUtils.makeNodePath(node_preview.spec.namespace, node_preview.spec)    
        this._set_last_pos(undefined);
    }

    onClickOnNode(node: SceneNode): void {
        // Select Node type id as path
        this.selected_docs_path = DocsPathUtils.makeNodePath(node.instance.spec.namespace, node.instance.spec);
        this._set_last_pos(undefined);
    }
}
