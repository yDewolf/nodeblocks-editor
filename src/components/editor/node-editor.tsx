import { NodeController } from "../nodes/node-controller";
import { EditorSpace } from "./editor-space";
import { createSignal, For, Show } from "solid-js";
import { BaseNode } from "../nodes/base-node";
import { Grid } from "../misc/grid";
import { SelectionController } from "./controllers/selection-controller";
import { ToolController } from "./controllers/tool-controller";
import { NodeSlot } from '../nodes/slot/node-slot';
import { ConnectionController } from './controllers/connection-controller';
import { ConnectionLines, ConnectionPreview } from '../misc/connection-lines';
import { Vector2 } from '../../data_types/geometry';
import { Keybind, KeybindMap, KeyEventManager, MouseButtons } from "./controllers/input-manager";

export class NodeEditor {
    node_controller: NodeController
    tool_controller: ToolController

    selection_controller: SelectionController
    connection_controller: ConnectionController

    input_manager: KeyEventManager

    editor_space: EditorSpace
    editor_grid: Grid

    // _isSpacePressed: () => boolean;
    // _setSpacePressed: (v: boolean) => void;

    _cursor_world_pos: () => Vector2;
    _set_cursor_world_pos: (v: Vector2) => void;

    constructor () {
        const [cursorWorldPos, setCursorWorldPos] = createSignal({x: 0, y: 0});
        this._cursor_world_pos = cursorWorldPos;
        this._set_cursor_world_pos = setCursorWorldPos;

        this.input_manager = new KeyEventManager();

        this.node_controller = new NodeController()
        this.editor_space = new EditorSpace()
        this.editor_grid = new Grid({x: 32, y: 32});

        this.selection_controller = new SelectionController(this.editor_space, this.editor_grid);
        this.connection_controller = new ConnectionController();
        
        this.tool_controller = new ToolController(this);
        this.setup_keybinds();
    }

    get cursor_world_pos() { return this._cursor_world_pos(); }
    set cursor_world_pos(v: Vector2) { this._set_cursor_world_pos(v); }

    public setup_keybinds() {
        this.input_manager.set_keybind_handler(
            new Keybind("Move", [new KeybindMap({keys: ["Space"]}), new KeybindMap({mouse_buttons: [MouseButtons.MIDDLE]})]),
            (data) => {

            }
        )
    }

    public View() {
        
        let viewportRef: HTMLDivElement | undefined;
        // const onKeyDown = (e: KeyboardEvent) => {
        //     if (e.code === "Space") this._setSpacePressed(true);
        // }

        // const onKeyUp = (e: KeyboardEvent) => {
        //     if (e.code === "Space") this._setSpacePressed(false);
        // };

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
            if (e.target !== e.currentTarget) return;


            if (e.button == 2) {
                this.node_controller.add_node("Teste", {x: world_pos.x, y: world_pos.y})
            }

            this.tool_controller.current_tool?.onPointerDown(e);
        }
        
        const onPointerMove = (e: PointerEvent) => {
            const [screen_pos, world_pos] = this.editor_space.get_cursor_pos(e)
            this.cursor_world_pos = world_pos;
            if (this.input_manager.get_keybind_state("Move")) {
                this.editor_space.camera.move({
                    x: -e.movementX / this.editor_space.camera.zoom,
                    y: -e.movementY / this.editor_space.camera.zoom
                });
                return;
            }
            this.tool_controller.current_tool?.onMoveCursor(world_pos, {x: e.movementX, y: e.movementY}, this.node_controller.nodes);
        };

        const onPointerUp = (e: PointerEvent) => {
            this.tool_controller.current_tool?.onPointerUp(e);

            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        };

        
    
        return (
            <div 
                class="editor-view"
            >   
                <div 
                    class="viewport"
                    style={{
                        position: "absolute", 
                        height: "100%", 
                        width: "100%"
                    }}
                    classList={{
                        'move-mode': this.input_manager.get_keybind_state("Move"),
                        'moving-mode': this.selection_controller.moving
                    }}

                    oncontextmenu={(e) => {e.preventDefault()}}
                    tabindex="0"
                    onKeyDown={(e) => this.input_manager.onKeyDown(e)}
                    onKeyUp={(e) => this.input_manager.onKeyUp(e)}
                    onWheel={(e) => this.input_manager.onWheel(e)}

                    onPointerMove={onPointerMove} 
                    onPointerDown={(e) => this.input_manager.onPointerDown(e)} 
                    onPointerUp={(e) => this.input_manager.onPointerUp(e)} 
                    onPointerLeave={(e) => this.input_manager.onPointerUp(e)}
                    onMouseOver={() => {
                        this.tool_controller.current_tool?.onHoverBackground();
                    }}
                >
                    <div 
                        style={{
                        position: "absolute",
                        inset: 0,
                        "pointer-events": "none"
                    }}>
                        {this.editor_grid.View(this.editor_space.camera)}
                    </div>
                    
                    <div 
                        class="world-space"
                        ref={viewportRef} 
                        style={{
                            transform: `scale(${this.editor_space.camera.zoom}) translate(${-this.editor_space.camera.offset.x}px, ${-this.editor_space.camera.offset.y}px)`,
                            position: "absolute",
                            "transform-origin": "0 0"
                        }}
                    >
                        <Show when={this.selection_controller.selection_rect.active}>
                            {this.selection_controller.selection_rect.View()}
                        </Show>
                        <svg style={{
                            position: "absolute",
                            inset: 0,
                            overflow: "visible",
                            "pointer-events": "none",
                        }}>
                            <For each={this.connection_controller.connections}>
                                {(conn) => <ConnectionLines 
                                    connection={conn} 
                                    onDisconnect={() => this.connection_controller.disconnect_nodes(conn)} 
                                />}
                            </For>
                            
                            <Show when={this.connection_controller.selected_slot}>
                                <ConnectionPreview start_slot={this.connection_controller.selected_slot} hovered_slot={this.connection_controller.hovered_slot} cursor_pos={this.cursor_world_pos}/>
                            </Show>
                        </svg>

                        <For each={this.node_controller.nodes}>
                            {(node) => {
                                return (node.View(
                                    this.editor_space.camera, 
                                    (node: BaseNode) => {
                                        this.tool_controller.current_tool?.onClickOnNode(node);
                                    },
                                    (slot: NodeSlot) => {
                                        this.tool_controller.current_tool?.onClickOnNodeSlot(slot);
                                    },
                                    (node: BaseNode) => {
                                        this.tool_controller.current_tool?.onHoverNode(node);
                                    },
                                    (slot: NodeSlot) => {
                                        this.tool_controller.current_tool?.onHoverSlot(slot);
                                    })
                                )
                            }}
                        </For>
                    </div>
                </div>
                
                <div class="editor-ui">
                    <div class="left-tab">

                    </div>
                    <div class="middle-tab">
                        {this.tool_controller.View()}
                    </div>
                    <div class="right-tab">
                         
                    </div>
                </div>
            </div>
        );
    }
}