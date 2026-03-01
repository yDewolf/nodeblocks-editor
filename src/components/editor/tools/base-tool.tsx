import { BaseNode } from "~/components/nodes/base-node";
import { NodeSlot } from "~/components/nodes/node-slot";
import { Vector2 } from "~/data_types/geometry";
import { NodeEditor } from "../node-editor";

export interface EditorTool {
    onKeyDown(e: KeyboardEvent): void;

    onKeyUp(e: KeyboardEvent): void;

    onWheel(e: WheelEvent): void;

    onPointerDown(e: PointerEvent): void;

    onPointerUp(e: PointerEvent): void;

    onClickOnNode(node: BaseNode): void;

    onClickOnNodeSlot(slot: NodeSlot): void;

    onMoveCursor(pos: Vector2, delta: Vector2, all_nodes: BaseNode[]): void;

    onHoverNode(node: BaseNode): void;

    onHoverSlot(slot: NodeSlot): void;

    onHoverBackground(): void;
}

export abstract class BaseEditorTool implements EditorTool {
    node_editor: NodeEditor

    constructor(node_editor: NodeEditor) {
        this.node_editor = node_editor;
    }

    onKeyDown(e: KeyboardEvent): void {
    }
    onKeyUp(e: KeyboardEvent): void {
    }
    onWheel(e: WheelEvent): void {
    }
    onPointerDown(e: PointerEvent): void {
    }
    onPointerUp(e: PointerEvent): void {
    }
    
    onClickOnNode(node: BaseNode): void {
    }
    onClickOnNodeSlot(slot: NodeSlot): void {
    }
    onMoveCursor(pos: Vector2, delta: Vector2, all_nodes: BaseNode[]): void {
    }
    
    onHoverNode(node: BaseNode): void {
    }
    onHoverSlot(slot: NodeSlot): void {
    }
    onHoverBackground(): void {
    }
}