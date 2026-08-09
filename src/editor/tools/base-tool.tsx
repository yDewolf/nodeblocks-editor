import { GraphNode } from "~/wrapper/nodes/graph-node";
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot";
import { Vector2 } from "~/wrapper/data_types/geometry";
import { NodeEditor } from "../node-editor";
import { NodeTypePreview } from "../ui/editor/subpanels/node-type-selector";

export interface ComponentEventHandler {
    onKeyDown(e: KeyboardEvent): void;

    onKeyUp(e: KeyboardEvent): void;

    onWheel(e: WheelEvent): void;

    onPointerMove(e: PointerEvent): void;

    onPointerDown(e: PointerEvent): void;

    onPointerUp(e: PointerEvent): void;

    globalOnPointerDown(e: PointerEvent): void;
    globalOnPointerUp(e: PointerEvent): void
    globalOnPointerMove(e: PointerEvent): void

    onClickOnNode(node: GraphNode): void;

    onClickOnNodeSlot(slot: NodeSlot): void;

    onHoverNode(node: GraphNode): void;
    
    onHoverSlot(slot: NodeSlot): void;
    
    onClickOnNodePreview(node_preview: NodeTypePreview): void;

    onHoverBackground(): void;

}

export abstract class BaseEventHandler implements ComponentEventHandler {
    
    onClickOnNodePreview(node_preview: NodeTypePreview): void {
    }
    onKeyDown(e: KeyboardEvent): void {
    }
    onKeyUp(e: KeyboardEvent): void {
    }
    onWheel(e: WheelEvent): void {
    }

    onPointerMove(e: PointerEvent): void {
    }
    onPointerDown(e: PointerEvent): void {
    }
    onPointerUp(e: PointerEvent): void {
    }

    globalOnPointerDown(e: PointerEvent): void {}
    globalOnPointerUp(e: PointerEvent): void {}
    globalOnPointerMove(e: PointerEvent): void {}

    onClickOnNode(node: GraphNode): void {
    }
    onClickOnNodeSlot(slot: NodeSlot): void {
    }
    onMoveCursor(pos: Vector2, delta: Vector2, all_nodes: GraphNode[]): void {
    }
    
    onHoverNode(node: GraphNode): void {
    }
    onHoverSlot(slot: NodeSlot): void {
    }
    onHoverBackground(): void {
    }
}

export interface EditorTool extends ComponentEventHandler {
    onMoveCursor(pos: Vector2, delta: Vector2, all_nodes: GraphNode[]): void;
}

export abstract class BaseEditorTool extends BaseEventHandler {
    node_editor: NodeEditor

    constructor(node_editor: NodeEditor) {
        super();
        this.node_editor = node_editor;
    }
}