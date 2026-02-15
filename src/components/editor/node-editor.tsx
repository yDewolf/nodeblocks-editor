import { NodeController } from "../nodes/node-controller";
import { EditorSpace } from "./editor-space";
import { createSignal, For, Show } from "solid-js";
import { BaseNode } from "../nodes/base-node";
import { NodeView } from "../nodes/node-component";
import { Grid } from "../misc/grid";
import { SelectionController } from "./selection-controller";

export class NodeEditor {
    node_controller: NodeController
    selection_controller: SelectionController
    editor_space: EditorSpace
    editor_grid: Grid

    _isSpacePressed: () => boolean;
    _setSpacePressed: (v: boolean) => void;

    constructor () {
        this.node_controller = new NodeController()
        this.editor_space = new EditorSpace()
        this.editor_grid = new Grid({x: 32, y: 32});
        this.selection_controller = new SelectionController(this.editor_space, this.editor_grid);
        
        const [space, setSpace] = createSignal(false);
        this._isSpacePressed = space;
        this._setSpacePressed = setSpace;
    }

    public View() {
        let viewportRef: HTMLDivElement | undefined;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space") this._setSpacePressed(true);
        }

        const onKeyUp = (e: KeyboardEvent) => {
            if (e.code === "Space") this._setSpacePressed(false);
        };

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();

            const delta = -e.deltaY * 0.001;
            const new_zoom = Math.max(0.1, Math.min(5.0, this.editor_space.camera.zoom + delta));
            const [screen_pos, world_pos] = this.editor_space.get_cursor_pos(e)
            
            this.editor_space.camera.zoom = new_zoom;
            this.editor_space.camera.updateOffset({
                x: world_pos.x - (screen_pos.x / new_zoom),
                y: world_pos.y - (screen_pos.y / new_zoom)
            });
        };

        const onPointerDown = (e: PointerEvent) => {
            const [screen_pos, world_pos] = this.editor_space.get_cursor_pos(e)
            if (e.button == 0) {
                // if (e.target !== e.currentTarget) return;
                if (this.selection_controller.has_selected) {
                    this.selection_controller.clearSelection();
                }
    
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                this.selection_controller.onStartMultipleSelection({x: world_pos.x, y: world_pos.y});
            }

            if (e.button == 2) {
                this.node_controller.add_node("Teste", {x: world_pos.x, y: world_pos.y})
            } 
        }
        
        const onPointerMove = (e: PointerEvent) => {
            const [screen_pos, world_pos] = this.editor_space.get_cursor_pos(e)
            if (this._isSpacePressed()) {
                this.editor_space.camera.move({
                    x: -e.movementX / this.editor_space.camera.zoom,
                    y: -e.movementY / this.editor_space.camera.zoom
                });
                return;
            }

            this.selection_controller.onMoveCursor(
                {x: world_pos.x, y: world_pos.y}, 
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
            <div 
                class="editor-view" 
                classList={{
                    'move-mode': this._isSpacePressed(),
                    'moving-mode': this.selection_controller.moving
                }}
                oncontextmenu={(e) => {e.preventDefault()}}
                tabindex="0"
                onKeyDown={onKeyDown}
                onKeyUp={onKeyUp}
                onWheel={onWheel}

                onPointerMove={onPointerMove} 
                onPointerDown={onPointerDown} 
                onPointerUp={onPointerUp} 
                onPointerLeave={onPointerUp}
            >
                <div style={{
                    position: "absolute",
                    inset: 0,
                    "pointer-events": "none"
                }}>
                    {this.editor_grid.View(this.editor_space.camera)}
                </div>
                
                <div class="viewport" style={{position: "absolute", height: "100%", width: "100%"}}>
                    <div 
                        class="world-space" 
                        ref={viewportRef} 
                        style={{
                            transform: `scale(${this.editor_space.camera.zoom}) translate(${-this.editor_space.camera.offset.x}px, ${-this.editor_space.camera.offset.y}px)`,
                            position: "absolute",
                            inset: 0,
                            "transform-origin": "0 0"
                        }}
                    >
                        <Show when={this.selection_controller.selection_rect.active}>
                            {this.selection_controller.selection_rect.View()}
                        </Show>
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
            </div>
        );
    }
}