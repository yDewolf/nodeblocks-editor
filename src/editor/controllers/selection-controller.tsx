import { createEffect, createRoot, createSignal } from "solid-js";
import { EditorSpace } from "~/editor/internal/editor-space";
import { Vector2 } from "~/wrapper/data_types/geometry";
import { GraphNode } from "~/wrapper/nodes/graph-node";
import { Grid } from "../ui/misc/grid";
import { SelectionRect } from "../ui/misc/selection_rect";
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot";
import { ConnectionController } from "~/wrapper/controllers/connection-controller";
import { ConnActionUtils } from '../../network/controllers/actions/conn-actions';
import { NodeEditor } from "../node-editor";
import { ConnSceneRequestData } from "~/network/websocket/request-types";
import { NodeSceneFile } from '../../wrapper/helpers/node-scene-file';
import { NodeActionUtils } from "~/network/controllers/actions/node-actions";
import { debounce, throttle } from "../utils/debounce-utils";

export class SelectionController {
    selection_rect: SelectionRect
    editor_space: EditorSpace
    editor_grid: Grid
    _editor: NodeEditor

    _selected_nodes: () => GraphNode[];
    _set_selected_nodes: (nodes: GraphNode[]) => void;
    
    _hovered_node: () => GraphNode | null;
    _set_hovered_node: (node: GraphNode | null) => void;
    
    _selected_slot: () => NodeSlot | null;
    _set_selected_slot: (slot: NodeSlot | null) => void;

    _hovered_slot: () => NodeSlot | null;
    _set_hovered_slot: (slot: NodeSlot | null) => void;

    area_selection: boolean = false;
    selecting: boolean = false;
    _moving: () => boolean;
    _setMoving: (value: boolean) => void;
    private debounced_request_update: Function;
    
    protected _selected_node_type: () => string | undefined;
    protected _set_selected_node_type: (type: string | undefined) => void;
    
    constructor(editor_space: EditorSpace, editor_grid: Grid, editor: NodeEditor) {
        this._editor = editor;
        this.editor_space = editor_space
        this.editor_grid = editor_grid;
        
        const [selectedNode, setSelectedNode] = createSignal<GraphNode[]>([]);
        this._selected_nodes = selectedNode
        this._set_selected_nodes = setSelectedNode

        const [selectedNodeType, setSelectedNodeType] = createSignal<string | undefined>(undefined);
        this._selected_node_type = selectedNodeType;
        this._set_selected_node_type = setSelectedNodeType;

        const [hoveredNode, sethoveredNode] = createSignal(null);
        this._hovered_node = hoveredNode;
        this._set_hovered_node = sethoveredNode;

        const [selectedSlot, setSelectedSlot] = createSignal(null);
        this._selected_slot = selectedSlot;
        this._set_selected_slot = setSelectedSlot;

        const [hoveredSlot, sethoveredSlot] = createSignal(null);
        this._hovered_slot = hoveredSlot;
        this._set_hovered_slot = sethoveredSlot;

        const [moving, setMoving] = createSignal(false);
        this._moving = moving
        this._setMoving = setMoving
        
        this.debounced_request_update = debounce((nodes: any) => {
            NodeActionUtils.request_update_nodes(nodes, this._editor._action_controller);
        }, 100);

        this.selection_rect = new SelectionRect(this.editor_space.camera);
        
        createRoot(() => {
            // Listen to file updates so it clears selections when file changes
            createEffect(() => {
                this._editor.scene_controller.node_type_reader.keep_track();
                this._editor.scene_controller.node_scene_reader.keep_track();
                this.clear();
            })
        });
    }
    
    get moving() { return this._moving(); }
    set moving(value: boolean) { this._setMoving(value) }

    get hovered_node() { return this._hovered_node(); }
    set hovered_node(node: GraphNode | null) { this._set_hovered_node(node); }

    get selected_node_type() { return this._selected_node_type(); }
    set selected_node_type(node_type: string | undefined) { this._set_selected_node_type(node_type); }


    get selected_nodes() { return this._selected_nodes() }
    private set selected_nodes(value: GraphNode[]) { this._set_selected_nodes(value) }

    get selected_slot() { return this._selected_slot() }
    set selected_slot(slot: NodeSlot | null) { this._set_selected_slot(slot) }

    get hovered_slot() { return this._hovered_slot() }
    set hovered_slot(slot: NodeSlot | null) { this._set_hovered_slot(slot) }

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

    public onClickOnNode(node: GraphNode) {
        if (this.selected_nodes.includes(node)) {
            this.selecting = false;
            this.moving = true;
            return;
        }

        this.area_selection = false;
        this.selecting = true;
        
        this.selected_nodes.forEach(node => {
            node.selected = false;
        });

        this._set_selected_nodes([node]);
        node.selected = true;
    }

    public stopSelection() { 
        if (this.area_selection) {
            this.stopAreaSelection();
        }

        this.selecting = false;
    }

    public clearSelection() { 
        this.selected_nodes.forEach(node => {
            node.selected = false;
        });
        this._set_selected_nodes([])
    }

    public onMoveCursor(pos: Vector2, delta: Vector2, all_nodes: GraphNode[]) {
        if (this.moving) {
            this.selected_nodes.forEach(node => {
                node.move({
                    x: delta.x / this.editor_space.camera.zoom,
                    y: delta.y / this.editor_space.camera.zoom
                }, this.editor_grid.grid);
            });
            this.debounced_request_update(this.selected_nodes);
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
            let nodes_to_remove = new Array<GraphNode>()
            this.selected_nodes.forEach(node => {
                if (overlapping_nodes.includes(node)) { 
                    return;
                }
                node.selected = false;
                nodes_to_remove.push(node);
            });
            this.selected_nodes = this.selected_nodes.filter((node) => {!nodes_to_remove.includes(node)})
            overlapping_nodes.forEach(node => {
                if (this.selected_nodes.includes(node)) {
                    return;
                }

                this._set_selected_nodes([...this.selected_nodes, node])
                node.selected = true;
                node.select();
            });
        }
    }

    public select_slot(slot: NodeSlot) {
        if (this.selected_slot != null) {
            const conn = this._editor.scene_controller.connection_controller.are_connected(this.selected_slot, slot)
            if (conn != undefined) {
                ConnActionUtils.request_disconnect([conn], this._editor._action_controller);
                this.unselect_slot();
                return;
            }

            let conns: ConnSceneRequestData = {};
            conns[ConnectionController.make_conn_uid()] = {
                from_slot: NodeSceneFile.make_slot_path(this.selected_slot), 
                to_slot: NodeSceneFile.make_slot_path(slot)
            };
            ConnActionUtils.request_connect(conns, this._editor._action_controller);
            // TODO: Desselect slot only if shift is not pressed
            this.unselect_slot();
            return;
        }

        this.unselect_slot();
        this.selected_slot = slot;
        this.selected_slot.selected = true;
    }

    public unselect_slot() {
        if (this.selected_slot != null) {
            this.selected_slot.selected = false;
        } 
        this.selected_slot = null;
    }
}