import { createSignal } from "solid-js";
import { SelectionRect } from "../misc/selection_rect";
import { EditorCamera, EditorSpace } from "./editor-space";
import { BaseNode } from "../nodes/base-node";
import { Vector2 } from "~/data_types/geometry";
import { Grid } from "../misc/grid";

export class SelectionController {
    selection_rect: SelectionRect
    editor_space: EditorSpace
    editor_grid: Grid

    _selectedNodes: () => BaseNode[];
    _setSelectedNodes: (nodes: BaseNode[]) => void;
    
    multiple_selection: boolean = false;
    selecting: boolean = false;
    moving: boolean = false;
    
    constructor(editor_space: EditorSpace, editor_grid: Grid) {
        this.editor_space = editor_space
        this.editor_grid = editor_grid;
        
        const [selectedNode, setSelectedNode] = createSignal<BaseNode[]>([]);
        this._selectedNodes = selectedNode
        this._setSelectedNodes = setSelectedNode
        
        this.selection_rect = new SelectionRect(this.editor_space.camera);
    }
    
    get selected_nodes() { return this._selectedNodes() }
    get has_selected() { return this.selected_nodes.length > 0; }

    public onStartMultipleSelection(pos: Vector2) {
        this.multiple_selection = true;
        this.selecting = true;

        this.selection_rect.pos = {x: pos.x, y: pos.y};
        this.selection_rect.origin = {x: pos.x, y: pos.y};
        this.selection_rect.size = { x: 0, y: 0 };
        this.selection_rect.active = true;
    }

    public stopMultipleSelection() {
        this.selection_rect.active = false;
        this.multiple_selection = false;
        
        this.selecting = false;
    }

    public onClickOnNode(node: BaseNode) {
        if (this.selected_nodes.includes(node)) {
            this.selecting = false;
            this.moving = true;
            // console.log("move")
            return;
        }

        this.multiple_selection = false;
        this.selecting = true;
        
        this._setSelectedNodes([node]);
        node.select()
    }

    public stopSelection() { 
        if (this.multiple_selection) {
            this.stopMultipleSelection();
        }

        this.selecting = false;
    }

    public clearSelection() { 
        this._setSelectedNodes([])
        // console.log("resetting")
    }

    public onMoveCursor(pos: Vector2, delta: Vector2, all_nodes: BaseNode[]) {
        if (this.moving) {
            // console.log("moving")
            this.selected_nodes.forEach(node => {
                node.move({
                    x: delta.x / this.editor_space.camera.zoom,
                    y: delta.y / this.editor_space.camera.zoom
                }, this.editor_grid.grid);
            });
        }

        if (this.multiple_selection && this.selecting) {
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
            overlapping_nodes.forEach(node => {
                if (this.selected_nodes.includes(node)) {
                    return;
                }

                this._setSelectedNodes([...this.selected_nodes, node])
                node.select();
            });
        }
    }
}