import { BaseEditorTool } from "./base-tool";
import { GraphNode } from "~/wrapper/nodes/graph-node";
import { Vector2 } from "~/wrapper/data_types/geometry";
import { NodeEditor } from "../node-editor";
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot";
import { ConnectionController } from "../../wrapper/controllers/connection-controller";
import { NodeController } from "~/wrapper/controllers/node-controller";
import { SelectionController } from "~/editor/controllers/selection-controller";
import { createSignal } from "solid-js";
import { NodeTypePreview } from "../ui/editor/subpanels/node-type-selector";

export class SelectionTool extends BaseEditorTool {
    selection_controller: SelectionController
    connection_controller: ConnectionController;
    node_controller: NodeController;
    node_editor: NodeEditor

    protected _selected_preview: () => NodeTypePreview | null;
    protected _set_selected_preview: (preview: NodeTypePreview | null) => void;
    
    get selected_preview() {return this._selected_preview()}
    protected set selected_preview(preview: NodeTypePreview | null) {
        this._set_selected_preview(preview)
        this.selection_controller.selected_node_type = preview != null ? preview.node_constructor.type_id : undefined;
    }

    constructor(node_editor: NodeEditor) {
        super(node_editor);
        const [selectedPreview, setSelectedPreview] = createSignal(null);
        this._selected_preview = selectedPreview;
        this._set_selected_preview = setSelectedPreview;

        this.selection_controller = node_editor.selection_controller;
        this.connection_controller = node_editor.scene_controller.connection_controller;
        this.node_controller = node_editor.scene_controller.node_controller;
        
        this.node_editor = node_editor;
    }

    onClickOnNodeSlot(slot: NodeSlot): void {
        this.selection_controller.select_slot(slot);
        this.selection_controller.clearSelection();
    }

    onPointerDown(e: PointerEvent): void {
        const [screen_pos, world_pos] = this.selection_controller.editor_space.get_cursor_pos(e)
        if (e.button == 0) {
            if (this.selection_controller.has_selected) {
                this.selection_controller.clearSelection();
            }
            this.selection_controller.unselect_slot();

            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            this.selection_controller.onStartAreaSelection({x: world_pos.x, y: world_pos.y});
        }
    }

    onPointerUp(e: PointerEvent): void {
        this.selection_controller.moving = false;
        if (this.selection_controller.selecting) {
            this.selection_controller.stopSelection();
        }

        if (this.selected_preview) {
            this.selected_preview.selected = false;
            this.selected_preview = null;
        }
    }

    onClickOnNode(node: GraphNode): void {
        this.selection_controller.unselect_slot();
        this.selection_controller.onClickOnNode(node)
    }

    onMoveCursor(pos: Vector2, delta: Vector2, all_nodes: GraphNode[]): void {
        this.selection_controller.onMoveCursor(
            pos, 
            delta,
            all_nodes
        )

        if (this.selection_controller.moving) {
            this.selection_controller.selected_nodes.forEach(node => {
                node.all_slots.forEach(slot => {
                    slot.update_anchor();
                });
            });
        }
    }

    onClickOnNodePreview(node_preview: NodeTypePreview): void {
        if (this.selected_preview != null) {
            this.selected_preview.selected = false
        }
        node_preview.selected = true;
        this.selected_preview = node_preview
    }

    onHoverSlot(slot: NodeSlot): void {
        this.selection_controller.hovered_slot = slot;
        this.selection_controller.hovered_node = slot.parent_node;
    }

    onHoverNode(node: GraphNode): void {
        this.selection_controller.hovered_node = node;
    }

    onHoverBackground(): void {
        this.selection_controller.hovered_node = null;
        this.selection_controller.hovered_slot = null;
    }
}