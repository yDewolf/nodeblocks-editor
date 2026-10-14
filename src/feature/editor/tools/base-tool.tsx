import { SceneNode } from "~/feature/scene/objects/scene-node";
import { SceneNodeSlot } from "~/feature/scene/objects/scene-slot";
import { Vector2 } from "~/protocols/nodeblocks/geometry";
import { NodeTypePreview } from "../components/subpanels/component/node-type-selector";
import { InputManager } from "~/utils/keybinds/input-manager";
import { InputContext } from "~/utils/keybinds/input-context";


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

    onClickOnNode(node: SceneNode): void;

    onClickOnNodeSlot(slot: SceneNodeSlot): void;

    onHoverNode(node: SceneNode): void;
    
    onHoverSlot(slot: SceneNodeSlot): void;
    
    onClickOnNodePreview(node_preview: NodeTypePreview): void;

    onHoverBackground(): void;
}

export abstract class BaseEventHandler implements ComponentEventHandler {
    
    onClickOnNodePreview(node_preview: NodeTypePreview): void {}
    onKeyDown(e: KeyboardEvent): void { }
    onKeyUp(e: KeyboardEvent): void { }
    onWheel(e: WheelEvent): void { }

    onPointerMove(e: PointerEvent): void { }
    onPointerDown(e: PointerEvent): void { }
    onPointerUp(e: PointerEvent): void { }

    globalOnPointerDown(e: PointerEvent): void { }
    globalOnPointerUp(e: PointerEvent): void { }
    globalOnPointerMove(e: PointerEvent): void { }

    onClickOnNode(node: SceneNode): void { }
    onClickOnNodeSlot(slot: SceneNodeSlot): void { }
    onMoveCursor(pos: Vector2, delta: Vector2, all_nodes: SceneNode[]): void { }
    
    onHoverNode(node: SceneNode): void { }
    onHoverSlot(slot: SceneNodeSlot): void { }
    onHoverBackground(): void { }
}

export interface EditorTool extends ComponentEventHandler {
    setupKeybinds(inputContext: InputContext): void;
    cleanupKeybinds(inputContext: InputContext): void;
    
    onMoveCursor(pos: Vector2, delta: Vector2, all_nodes: SceneNode[]): void;
}

export abstract class BaseEditorTool extends BaseEventHandler {
    public setupKeybinds(inputContext: InputContext) {

    }

    public cleanupKeybinds(inputContext: InputContext) {

    }
}