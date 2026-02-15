import { NodeController } from "../nodes/node-controller";
import { EditorSpace } from "./editor-space";
import { For, Show } from "solid-js";
import { BaseNode } from "../nodes/base-node";
import { NodeView } from "../nodes/node-component";
import { Grid } from "../misc/grid";
import { SelectionController } from "./selection-controller";

export class NodeEditor {
    node_controller: NodeController
    selection_controller: SelectionController
    editor_space: EditorSpace
    editor_grid: Grid

    constructor () {
        this.node_controller = new NodeController()
        this.editor_space = new EditorSpace()
        this.editor_grid = new Grid({x: 32, y: 32});
        this.selection_controller = new SelectionController(this.editor_space, this.editor_grid);
    }

    public View() {
        let viewportRef: HTMLDivElement | undefined;
        const onPointerDown = (e: PointerEvent) => {
            if (e.button == 0) {
                // if (e.target !== e.currentTarget) return;
                if (this.selection_controller.has_selected) {
                    this.selection_controller.clearSelection();
                }
    
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                this.selection_controller.onStartMultipleSelection({x: e.clientX, y: e.clientY});
            }

            if (e.button == 2) {
                this.node_controller.add_node("Teste", {x: e.clientX, y: e.clientY})
            } 
        }
        
        const onPointerMove = (e: PointerEvent) => {
            this.selection_controller.onMoveCursor(
                {x: e.clientX, y: e.clientY}, 
                {x: e.movementX, y: e.movementY},
                this.node_controller.nodes
            )
        };

        const onPointerUp = (e: PointerEvent) => {
            this.selection_controller.moving = false;
            if (this.selection_controller.selecting) {
                this.selection_controller.stopSelection();
            }

            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        };

        return (
            <div class="editor-view" oncontextmenu={(e) => {e.preventDefault()}} onPointerMove={onPointerMove} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
                {this.editor_grid.View()}
                <Show when={this.selection_controller.selection_rect.active}>
                    {this.selection_controller.selection_rect.View()}
                </Show>
                <div class="viewport" ref={viewportRef}>
                    <For each={this.node_controller.nodes}>
                        {(node) => {
                            return (<NodeView 
                                node={node}
                                camera={this.editor_space.camera}
                                onClick={(node: BaseNode) => {
                                    this.selection_controller.onClickOnNode(node)
                                }}
                            />)
                        }}
                    </For>
                </div>
            </div>
        );
    }
}