import { SceneNodeSlot } from "~/feature/scene/objects/scene-slot";
import { SelectionController } from "../../scene/canvas/selection-controller";
import { BaseEditorTool } from "./base-tool";
import { SceneNode } from "~/feature/scene/objects/scene-node";
import { Vector2 } from "~/protocols/nodeblocks/geometry";
import { CanvasElementController } from "~/feature/scene/controllers/canvas-element-controller";
import { createSignal } from "solid-js";
import { NodeTypePreview } from "../components/subpanels/component/node-type-selector";
import { InputContext } from '../../../utils/keybinds/input-context';
import { ConnSceneRequestData, NodeSceneRequestData } from "~/protocols/nodeblocks/network/message/commands/node-graph-commands";
import { nanoid } from "nanoid";
import { ActionController } from "../actions/action-controller";
import { AddNodesAction } from "../actions/node/add-nodes-action";
import { NodeScene } from "../engine/node_scene";
import { RemoveConnectionsAction } from "../actions/conn/remove-conns-action";
import { AddConnectionsAction } from "../actions/conn/add-conns-action";
import { InputManager } from "~/utils/keybinds/input-manager";


export class SelectionTool extends BaseEditorTool {
    protected _selected_preview: () => NodeTypePreview | null;
    protected _set_selected_preview: (preview: NodeTypePreview | null) => void;

    constructor(
        private readonly scene: NodeScene,
        private readonly actionController: ActionController,
        private readonly selectionController: SelectionController,
        private readonly elementController: CanvasElementController,
        private readonly inputManager: InputManager
    ) {
        super();
        [this._selected_preview, this._set_selected_preview] = createSignal(null);
    }

    public setupKeybinds(inputContext: InputContext): void {
        inputContext.setHandlers("SecondaryToolAction", {
            handle_just_released: (event) => {
                const e = event.nativeEvent;
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
                    this.inputManager.blockNextContextMenu();
                    event.blockNextKeybinds();
                    e.preventDefault();
                }
            }
        })
    }

    private set selectedPreview(preview: NodeTypePreview | null) { this._set_selected_preview(preview); }
    get selectedPreview() { return this._selected_preview(); }

    onClickOnNodeSlot(slot: SceneNodeSlot): void {
        if (this.selectionController.selected_slot) {
            // Disconnect Slots
            const conn = this.scene.graph.areConnected(
                this.selectionController.selected_slot.path,
                slot.path
            );
            if (conn) {
                this.actionController.dispatch(
                    new RemoveConnectionsAction([conn.uid])
                )
                this.selectionController.unselect_slot();
                return;

            }
            // Connect Slots
            if (this.scene.graph.canConnect(
                this.selectionController.selected_slot.instance,
                slot.instance
            )) {
                let conns: ConnSceneRequestData = {};
                const uid = nanoid(8);
                conns[uid] = {
                    uid: uid,
                    from_slot: slot.isInput ? this.selectionController.selected_slot.path : slot.path,
                    to_slot: slot.isInput ? slot.path : this.selectionController.selected_slot.path,
                };
                this.actionController.dispatch(
                    new AddConnectionsAction(conns)
                );
    
                this.selectionController.unselect_slot();
                return;
            }
        }
        this.selectionController.select_slot(slot);
        this.selectionController.clearSelection();
    }

    // FIXME: rename this event to mainToolAction
    onPointerDown(e: PointerEvent): void {
        const [screen_pos, world_pos] = this.selectionController.space.get_cursor_pos(e)
        if (this.selectionController.has_selected && !e.shiftKey) {
            console.log("Cleared selection")
            this.selectionController.clearSelection();
        }
        this.selectionController.unselect_slot();
        
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        this.selectionController.onStartAreaSelection({x: world_pos.x, y: world_pos.y});
    }

    onPointerUp(e: PointerEvent): void {
        this.selectionController.moving = false;
        if (this.selectionController.selecting) {
            this.selectionController.stopSelection();
        }

        if (this.selectedPreview) {
            this.selectedPreview.selected = false;
            this.selectedPreview = null;
            this.selectionController.selected_node_type = undefined;
        }
    }

    onClickOnNode(node: SceneNode): void {
        if (!this.inputManager.getKeybindState("MainToolAction")) {
            return;
        }
        
        this.selectionController.unselect_slot();
        this.selectionController.onClickOnNode(node);
    }

    onMoveCursor(pos: Vector2, delta: Vector2, all_nodes: SceneNode[]): void {
        this.selectionController.onMoveCursor(
            pos, 
            delta,
            all_nodes
        )
        if (this.selectionController.moving) {
            this.selectionController.selected_nodes.forEach(node => {
                const conns = this.elementController.get_node_connections(node);
                conns.forEach((conn) => {
                    this.elementController.update_anchors_from_conn(conn);
                })
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