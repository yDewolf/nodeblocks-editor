import { createSignal } from "solid-js";
import { SelectionRect } from "../../misc/selection_rect";
import { EditorCamera, EditorSpace } from "../editor-space";
import { BaseNode } from "../../nodes/base-node";
import { Vector2 } from "~/data_types/geometry";
import { Grid } from "../../misc/grid";

export class SelectionController {
    selection_rect: SelectionRect
    editor_space: EditorSpace
    editor_grid: Grid

    _selectedNodes: () => BaseNode[];
    _setSelectedNodes: (nodes: BaseNode[]) => void;
    
    area_selection: boolean = false;
    selecting: boolean = false;
    _moving: () => boolean;
    _setMoving: (value: boolean) => void;
    
    constructor(editor_space: EditorSpace, editor_grid: Grid) {
        this.editor_space = editor_space
        this.editor_grid = editor_grid;
        
        const [selectedNode, setSelectedNode] = createSignal<BaseNode[]>([]);
        this._selectedNodes = selectedNode
        this._setSelectedNodes = setSelectedNode
        
        const [moving, setMoving] = createSignal(false);
        this._moving = moving
        this._setMoving = setMoving
        
        this.selection_rect = new SelectionRect(this.editor_space.camera);
    }
    
    get moving() { return this._moving(); }
    set moving(value: boolean) { this._setMoving(value) }

    get selected_nodes() { return this._selectedNodes() }
    private set selected_nodes(value: BaseNode[]) { this._setSelectedNodes(value) }

    get has_selected() { return this.selected_nodes.length > 0; }

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

    public onClickOnNode(node: BaseNode) {
        if (this.selected_nodes.includes(node)) {
            this.selecting = false;
            this.moving = true;
            // console.log("move")
            return;
        }

        this.area_selection = false;
        this.selecting = true;
        
        this.selected_nodes.forEach(node => {
            node.selected = false;
        });

        this._setSelectedNodes([node]);
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
        this._setSelectedNodes([])
        // console.log("resetting")
    }

    public onMoveCursor(pos: Vector2, delta: Vector2, all_nodes: BaseNode[]) {
        // pos.x = pos.x + this.editor_space.camera.offset.x
        // pos.y = pos.y + this.editor_space.camera.offset.y

        if (this.moving) {
            this.selected_nodes.forEach(node => {
                node.move({
                    x: delta.x / this.editor_space.camera.zoom,
                    y: delta.y / this.editor_space.camera.zoom
                }, this.editor_grid.grid);
            });
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
            let nodes_to_remove = new Array<BaseNode>()
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

                this._setSelectedNodes([...this.selected_nodes, node])
                node.selected = true;
                node.select();
            });
        }
    }
}