import { SceneNode } from "~/feature/scene/objects/scene-node";
import { CanvasSpace } from "./editor-space";
import { createSignal } from "solid-js";
import { debounce } from "~/utils/debounce-utils";
import { Grid } from "../components/canvas/grid";
import { SelectionRect } from "../components/canvas/selection_rect";
import { SceneNodeSlot } from "~/feature/scene/objects/scene-slot";
import { ActionController } from "../actions/action-controller";
import { UpdateNodesAction } from "../actions/node/update-nodes-actions";
import { NodeSceneRequestData } from "~/protocols/nodeblocks/network/message/commands/node-graph-commands";
import { Vector2 } from "~/protocols/nodeblocks/geometry";
import { NodeSceneData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";


export class SelectionController {
    selection_rect: SelectionRect

    _selected_nodes: () => SceneNode[];
    _set_selected_nodes: (nodes: SceneNode[]) => void;
    
    _hovered_node: () => SceneNode | null;
    _set_hovered_node: (node: SceneNode | null) => void;
    
    _selected_slot: () => SceneNodeSlot | null;
    _set_selected_slot: (slot: SceneNodeSlot | null) => void;

    _hovered_slot: () => SceneNodeSlot | null;
    _set_hovered_slot: (slot: SceneNodeSlot | null) => void;

    area_selection: boolean = false;
    selecting: boolean = false;
    _moving: () => boolean;
    _setMoving: (value: boolean) => void;
    private debounced_request_update: Function;
    
    protected _selected_node_type: () => string | undefined;
    protected _set_selected_node_type: (type: string | undefined) => void;
    
    constructor(
        private _space: CanvasSpace,
        private _grid: Grid,
        private actionController: ActionController
    ) {
        [this._selected_nodes, this._set_selected_nodes] = createSignal<SceneNode[]>([]);
        [this._selected_node_type, this._set_selected_node_type] = createSignal<string | undefined>(undefined);
        [this._hovered_node, this._set_hovered_node] = createSignal(null);

        [this._selected_slot, this._set_selected_slot] = createSignal(null);

        [this._hovered_slot, this._set_hovered_slot] = createSignal(null);

        [this._moving, this._setMoving] = createSignal(false);
        this.debounced_request_update = debounce((nodes: NodeSceneRequestData) => {
            this.actionController.dispatch(new UpdateNodesAction(nodes));
        }, 100);

        this.selection_rect = new SelectionRect();
        
        // createRoot(() => {
        //     // Listen to file updates so it clears selections when file changes
        //     createEffect(() => {
        //         this._editor.scene_controller.node_type_reader.keep_track();
        //         this._editor.scene_controller.node_scene_reader.keep_track();
        //         this.clear();
        //     })
        // });
    }

    get space() { return this._space }
    
    get grid() { return this._grid; }

    get moving() { return this._moving(); }
    set moving(value: boolean) { this._setMoving(value) }

    get hovered_node() { return this._hovered_node(); }
    set hovered_node(node: SceneNode | null) { this._set_hovered_node(node); }

    get selected_node_type() { return this._selected_node_type(); }
    set selected_node_type(node_type: string | undefined) { this._set_selected_node_type(node_type); }


    get selected_nodes() { return this._selected_nodes() }
    private set selected_nodes(value: SceneNode[]) { this._set_selected_nodes(value) }

    get selected_slot() { return this._selected_slot() }
    set selected_slot(slot: SceneNodeSlot | null) { this._set_selected_slot(slot) }

    get hovered_slot() { return this._hovered_slot() }
    set hovered_slot(slot: SceneNodeSlot | null) { this._set_hovered_slot(slot) }

    get has_selected() { return this.selected_nodes.length > 0; }

    public clear() {
        this._set_hovered_node(null);
        this._set_hovered_slot(null);
        this._set_selected_slot(null)
        this._set_selected_nodes([]);
    }

    public onStartAreaSelection(pos: Vector2) {
        this.area_selection = true;
        this.selecting = true;

        this.selection_rect.pos = {x: pos.x, y: pos.y};
        this.selection_rect.origin = {x: pos.x, y: pos.y};
        this.selection_rect.size = { x: 0, y: 0 };
        this.selection_rect.active = true;
    }

    public stopAreaSelection() {
        this.selection_rect.active = false;
        this.area_selection = false;
        
        this.selecting = false;
    }

    public onClickOnNode(node: SceneNode) {
        if (this.selected_nodes.includes(node)) {
            this.selecting = false;
            this.moving = true;
            return;
        }

        this.area_selection = false;
        this.selecting = true;
        
        this.selected_nodes.forEach(node => {
            node.isSelected = false;
        });

        this._set_selected_nodes([node]);
        node.isSelected = true;
    }

    public stopSelection() { 
        if (this.area_selection) {
            this.stopAreaSelection();
        }

        this.selecting = false;
    }

    public clearSelection() { 
        this.selected_nodes.forEach(node => {
            node.isSelected = false;
        });
        this._set_selected_nodes([])
    }

    public onMoveCursor(pos: Vector2, delta: Vector2, all_nodes: SceneNode[]) {
        if (this.moving) {
            this.selected_nodes.forEach(node => {
                node.position = {
                    x: node.position.x + delta.x / this._space.camera.zoom,
                    y: node.position.y + delta.y / this._space.camera.zoom
                }
                node.uiPosition = {
                    x: Math.round(node.position.x / this._grid.grid.x) * this._grid.grid.x,
                    y: Math.round(node.position.y / this._grid.grid.y) * this._grid.grid.y
                }
            });
            let node_datas: Record<string, NodeSceneData> = {};
            this.selected_nodes.forEach((node) => {
                node_datas[node.uid] = node.data;
            });
            this.debounced_request_update(node_datas);
        }

        if (Math.abs(delta.x) < 1 && Math.abs(delta.y) < 1) {
            return;
        }
        
        if (this.area_selection && this.selecting) {
            const origin = this.selection_rect.origin;

            const new_pos = {
                x: Math.min(origin.x, pos.x),
                y: Math.min(origin.y, pos.y)
            };

            const new_size = {
                x: Math.abs(pos.x - origin.x),
                y: Math.abs(pos.y - origin.y)
            }

            this.selection_rect.pos = new_pos;
            this.selection_rect.size = new_size;

            const overlapping_nodes = this.selection_rect.get_overlapping_nodes(all_nodes);
            let nodes_to_remove = new Array<SceneNode>()
            this.selected_nodes.forEach(node => {
                if (overlapping_nodes.includes(node)) { 
                    return;
                }
                node.isSelected = false;
                nodes_to_remove.push(node);
            });
            this.selected_nodes = this.selected_nodes.filter((node) => {!nodes_to_remove.includes(node)})
            overlapping_nodes.forEach(node => {
                if (this.selected_nodes.includes(node)) {
                    return;
                }

                this._set_selected_nodes([...this.selected_nodes, node])
                node.isSelected = true;
            });
        }
    }

    public select_slot(slot: SceneNodeSlot) {
        // if (this.selected_slot != null) {
            
        //     const conn = this._editor.scene_controller.connection_controller.are_connected(this.selected_slot, slot)
        //     if (conn != undefined) {
        //         ConnActionUtils.request_disconnect([conn], this._editor._action_controller);
        //         this.unselect_slot();
        //         return;
        //     }

        //     let conns: ConnSceneRequestData = {};
        //     conns[ConnectionController.make_conn_uid()] = {
        //         from_slot: NodeSceneFile.make_slot_path(this.selected_slot), 
        //         to_slot: NodeSceneFile.make_slot_path(slot)
        //     };
        //     ConnActionUtils.request_connect(conns, this._editor._action_controller);
        //     // TODO: Desselect slot only if shift is not pressed
        //     this.unselect_slot();
        //     return;
        // }

        this.unselect_slot();
        this.selected_slot = slot;
        this.selected_slot.isSelected = true;
    }

    public unselect_slot() {
        if (this.selected_slot != null) {
            this.selected_slot.isSelected = false;
        } 
        this.selected_slot = null;
    }
}