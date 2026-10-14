import { SceneNodeSlot } from "~/feature/scene/objects/scene-slot";
import { SelectionController } from "../canvas/selection-controller";
import { BaseEditorTool } from "./base-tool";
import { SceneNode } from "~/feature/scene/objects/scene-node";
import { Vector2 } from "~/protocols/nodeblocks/geometry";
import { CanvasElementController } from "~/feature/scene/controllers/canvas-element-controller";
import { createSignal } from "solid-js";
import { NodeTypePreview } from "../components/subpanels/component/node-type-selector";
import { InputContext } from '../../../utils/keybinds/input-context';
import { NodeSceneRequestData } from "~/protocols/nodeblocks/network/message/commands/node-graph-commands";
import { nanoid } from "nanoid";
import { ActionController } from "../actions/action-controller";
import { AddNodesAction } from "../actions/node/add-nodes-action";


export class SelectionTool extends BaseEditorTool {
    protected _selected_preview: () => NodeTypePreview | null;
    protected _set_selected_preview: (preview: NodeTypePreview | null) => void;

    constructor(
        private readonly actionController: ActionController,
        private readonly selectionController: SelectionController,
        private readonly elementController: CanvasElementController
    ) {
        super();
        [this._selected_preview, this._set_selected_preview] = createSignal(null);
    }

    public setupKeybinds(inputContext: InputContext): void {
        inputContext.setHandlers("SecondaryToolAction", {
            just_activated: (e) => {
                if (e instanceof PointerEvent) {
                    const [screen_pos, world_pos] = this.selectionController.space.get_cursor_pos(e)
                    if (e.target !== e.currentTarget) return;

                    if (!this.selectionController.selected_node_type) return;
                    let nodes: NodeSceneRequestData = {};
                    const uid = nanoid(6);
                    nodes[uid] = {
                        uid: uid,
                        nodetype_fqn: this.selectionController.selected_node_type,
                        position: {x: world_pos.x, y: world_pos.y},
                        data: {}
                    };
                    
                    this.actionController.dispatch(new AddNodesAction(nodes))
                    if (!e.shiftKey) {
                        this.selectionController.selected_node_type = undefined;
                    }
                }
            }
        })
    }

    private set selectedPreview(preview: NodeTypePreview | null) { this._set_selected_preview(preview); }
    get selectedPreview() { return this._selected_preview(); }

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

        if (this.selectedPreview) {
            this.selectedPreview.selected = false;
            this.selectedPreview = null;
            this.selectionController.selected_node_type = undefined
        }
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

    onClickOnNodePreview(node_preview: NodeTypePreview): void {
        if (this.selectedPreview != null) {
            this.selectedPreview.selected = false
        }
        node_preview.selected = true;
        this.selectedPreview = node_preview
        this.selectionController.selected_node_type = this.selectedPreview.nodetype
    }

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