import { SceneNodeSlot } from "~/feature/scene/objects/scene-slot";
import { SelectionController } from "../canvas/selection-controller";
import { BaseEditorTool } from "./base-tool";
import { SceneNode } from "~/feature/scene/objects/scene-node";
import { Vector2 } from "~/protocols/nodeblocks/geometry";
import { CanvasElementController } from "~/feature/scene/controllers/canvas-element-controller";


export class SelectionTool extends BaseEditorTool {
    // protected _selected_preview: () => NodeTypePreview | null;
    // protected _set_selected_preview: (preview: NodeTypePreview | null) => void;

    constructor(
        private readonly selectionController: SelectionController,
        private readonly elementController: CanvasElementController
    ) {
        super();
        // const [selectedPreview, setSelectedPreview] = createSignal(null);
        // this._selected_preview = selectedPreview;
        // this._set_selected_preview = setSelectedPreview;
    }

    onClickOnNodeSlot(slot: SceneNodeSlot): void {
        this.selectionController.select_slot(slot);
        this.selectionController.clearSelection();
    }

    onPointerDown(e: PointerEvent): void {
        const [screen_pos, world_pos] = this.selectionController.space.get_cursor_pos(e)
        if (e.button == 0) {
            if (this.selectionController.has_selected) {
                this.selectionController.clearSelection();
            }
            this.selectionController.unselect_slot();

            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            this.selectionController.onStartAreaSelection({x: world_pos.x, y: world_pos.y});
        }
    }

    onPointerUp(e: PointerEvent): void {
        this.selectionController.moving = false;
        if (this.selectionController.selecting) {
            this.selectionController.stopSelection();
        }

        // if (this.selected_preview) {
        //     this.selected_preview.selected = false;
        //     this.selected_preview = null;
        // }
    }

    onClickOnNode(node: SceneNode): void {
        this.selectionController.unselect_slot();
        this.selectionController.onClickOnNode(node)
    }

    onMoveCursor(pos: Vector2, delta: Vector2, all_nodes: SceneNode[]): void {
        this.selectionController.onMoveCursor(
            pos, 
            delta,
            all_nodes
        )
        if (this.selectionController.moving) {
            this.selectionController.selected_nodes.forEach(node => {
                node.all_slots.forEach(slot => {
                    this.elementController.update_slot_anchor(slot);
                });
            });
        }
    }

    // onClickOnNodePreview(node_preview: NodeTypePreview): void {
        // if (this.selected_preview != null) {
        //     this.selected_preview.selected = false
        // }
        // node_preview.selected = true;
        // this.selected_preview = node_preview
    // }

    onHoverSlot(slot: SceneNodeSlot): void {
        this.selectionController.hovered_slot = slot;
        this.selectionController.hovered_node = this.elementController.nodes[slot.node_id];
    }

    onHoverNode(node: SceneNode): void {
        this.selectionController.hovered_node = node;
    }

    onHoverBackground(): void {
        this.selectionController.hovered_node = null;
        this.selectionController.hovered_slot = null;
    }
}