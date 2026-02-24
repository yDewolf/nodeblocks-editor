import { SelectionController } from "../selection-controller";
import { EditorTool } from "./base-tool";
import { BaseNode } from "~/components/nodes/base-node";
import { Vector2 } from "~/data_types/geometry";
import { NodeEditor } from "../node-editor";

export class SelectionTool implements EditorTool {
    selection_controller: SelectionController
    node_editor: NodeEditor

    constructor(selection_controller: SelectionController, node_editor: NodeEditor) {
        this.selection_controller = selection_controller;
        this.node_editor = node_editor;
    }

    onKeyDown(e: KeyboardEvent): void {}

    onKeyUp(e: KeyboardEvent): void {}

    onWheel(e: WheelEvent): void {}

    onPointerDown(e: PointerEvent): void {
        const [screen_pos, world_pos] = this.selection_controller.editor_space.get_cursor_pos(e)

        if (e.button == 0) {
            if (this.selection_controller.has_selected) {
                this.selection_controller.clearSelection();
            }

            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            this.selection_controller.onStartMultipleSelection({x: world_pos.x, y: world_pos.y});
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
        this.selection_controller.onClickOnNode(node)
    }

    onMoveCursor(pos: Vector2, delta: Vector2, all_nodes: BaseNode[]): void {
        this.selection_controller.onMoveCursor(
            pos, 
            delta,
            all_nodes
        )
    }
}