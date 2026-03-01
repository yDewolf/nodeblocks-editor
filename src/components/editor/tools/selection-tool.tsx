import { SelectionController } from "../controllers/selection-controller";
import { BaseEditorTool } from "./base-tool";
import { BaseNode } from "~/components/nodes/base-node";
import { Vector2 } from "~/data_types/geometry";
import { NodeEditor } from "../node-editor";
import { NodeSlot } from "~/components/nodes/node-slot";
import { ConnectionController } from "../controllers/connection-controller";

export class SelectionTool extends BaseEditorTool {
    selection_controller: SelectionController
    connection_controller: ConnectionController;
    node_editor: NodeEditor

    constructor(node_editor: NodeEditor) {
        super(node_editor);
        this.selection_controller = node_editor.selection_controller;
        this.connection_controller = node_editor.connection_controller;
        this.node_editor = node_editor;
    }

    onClickOnNodeSlot(slot: NodeSlot): void {
        this.connection_controller.select_slot(slot);
        this.selection_controller.clearSelection();
    }

    onPointerDown(e: PointerEvent): void {
        const [screen_pos, world_pos] = this.selection_controller.editor_space.get_cursor_pos(e)

        if (e.button == 0) {
            if (this.selection_controller.has_selected) {
                this.selection_controller.clearSelection();
            }
            this.connection_controller.unselect_slot();

            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            this.selection_controller.onStartAreaSelection({x: world_pos.x, y: world_pos.y});
        }

        // if (e.button == 2) {
        //     this.node_controller.add_node("Teste", {x: world_pos.x, y: world_pos.y})
        // } 
    }

    onPointerUp(e: PointerEvent): void {
        this.selection_controller.moving = false;
        if (this.selection_controller.selecting) {
            this.selection_controller.stopSelection();
        }
    }

    onClickOnNode(node: BaseNode): void {
        this.connection_controller.unselect_slot();
        this.selection_controller.onClickOnNode(node)
    }

    onMoveCursor(pos: Vector2, delta: Vector2, all_nodes: BaseNode[]): void {
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

    onHoverSlot(slot: NodeSlot): void {
        this.connection_controller.hovered_slot = slot;
        this.selection_controller.hovered_node = slot.parent_node;
    }

    onHoverNode(node: BaseNode): void {
        this.selection_controller.hovered_node = node;
    }

    onHoverBackground(): void {
        this.selection_controller.hovered_node = null;
        this.connection_controller.hovered_slot = null;
    }
}