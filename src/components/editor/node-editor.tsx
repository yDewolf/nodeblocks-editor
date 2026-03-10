import { EditorSpace } from "./editor-space";
import { createSignal, For, Show } from "solid-js";
import { BaseNode } from "../nodes/base-node";
import { Grid } from "../misc/grid";
import { SelectionController } from "./controllers/selection-controller";
import { ToolController } from "./controllers/tool-controller";
import { NodeSlot } from '../nodes/slot/node-slot';
import { ConnectionLines, ConnectionPreview } from '../misc/connection-lines';
import { Vector2 } from '../../data_types/geometry';
import { KeyEventManager as GeneralEventManager } from "./input_manager/input-manager";
import { Keybind, KeybindMap, KeyModifiers, MouseButtons } from "./input_manager/keybind-events";
import { EventHandler, InputEvents } from "./input_manager/event-handling";
import { SceneController } from "./controllers/scene-controller";
import { scene_data_to_json } from "~/helpers/node-scene-file";
import { NodeTypeSelector } from "../misc/node-type-selector";

export class NodeEditor {
    scene_controller: SceneController;
    tool_controller: ToolController

    selection_controller: SelectionController
    input_manager: GeneralEventManager

    editor_space: EditorSpace
    editor_grid: Grid

    _cursor_world_pos: () => Vector2;
    _set_cursor_world_pos: (v: Vector2) => void;

    constructor () {
        this.scene_controller = new SceneController();

        const [cursorWorldPos, setCursorWorldPos] = createSignal({x: 0, y: 0});
        this._cursor_world_pos = cursorWorldPos;
        this._set_cursor_world_pos = setCursorWorldPos;

        this.input_manager = new GeneralEventManager();

        this.editor_space = new EditorSpace()
        this.editor_grid = new Grid({x: 32, y: 32});

        this.selection_controller = new SelectionController(this.editor_space, this.editor_grid);
        
        this.tool_controller = new ToolController(this);
        this.setup_event_handlers();
        this.setup_keybinds();
    }

    get cursor_world_pos() { return this._cursor_world_pos(); }
    set cursor_world_pos(v: Vector2) { this._set_cursor_world_pos(v); }

    private setup_keybinds() {
        this.input_manager.set_keybind_handler(
            new Keybind("PanCamera", [new KeybindMap({keys: ["Space"]}), new KeybindMap({mouse_buttons: [MouseButtons.MIDDLE]})]),
            {}
        );
        this.input_manager.set_keybind_handler(
            new Keybind("Zoom", [new KeybindMap({mouse_buttons: [MouseButtons.SCROLL]})]),{
            while_active: (data) => {
                const e = data.event;
                if (e instanceof WheelEvent) {
                    const delta = -e.deltaY * 0.001;
                    const new_zoom = Math.max(0.1, Math.min(5.0, this.editor_space.camera.zoom + delta));
                    const [screen_pos, world_pos] = this.editor_space.get_cursor_pos(e)
                    
                    this.editor_space.camera.zoom = new_zoom;
                    this.editor_space.camera.updateOffset({
                        x: world_pos.x - (screen_pos.x / new_zoom),
                        y: world_pos.y - (screen_pos.y / new_zoom)
                    });
                }
            }}
        );

        this.input_manager.set_keybind_handler(
            new Keybind("MainToolAction", [new KeybindMap({mouse_buttons: [MouseButtons.LEFT]})]),
            {just_activated: (data) => {
                const e = data.event;
                if (e instanceof PointerEvent) {
                    const [screen_pos, world_pos] = this.editor_space.get_cursor_pos(e)
                    if (e.target !== e.currentTarget) return;
    
                    this.tool_controller.current_tool?.onPointerDown(e);
                }
            },
            cleanup: (data) => {
                const e = data.event;
                if (e instanceof PointerEvent) {
                    this.tool_controller.current_tool?.onPointerUp(e);
                    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
                }
            }}
        );

        this.input_manager.set_keybind_handler(
            new Keybind("SecondaryToolAction", [new KeybindMap({mouse_buttons: [MouseButtons.RIGHT]})]),
            {just_activated: (data) => {
                const e = data.event;
                if (e instanceof PointerEvent) {
                    const [screen_pos, world_pos] = this.editor_space.get_cursor_pos(e)
                    if (e.target !== e.currentTarget) return;

                    this.scene_controller.node_controller.add_node("Teste", {x: world_pos.x, y: world_pos.y})
                }
            }}
        );
        
        this.input_manager.set_keybind_handler(
            new Keybind("SaveScene", [new KeybindMap({keys: ["KeyS"], modifiers: [KeyModifiers.ALT]})]),
            {just_activated: (data) => {
                const scene_data = this.scene_controller.save_scene();
                // console.log(JSON.stringify(scene_data));
                console.log(scene_data_to_json(scene_data));
            }}
        );
    }

    private setup_event_handlers() {
        this.input_manager.set_event_handler(
            InputEvents.POINTER_MOVING,
            new EventHandler("onPointerMove", 
                (data) => {
                    const e = data.event;
                    if (e instanceof PointerEvent) {
                        const [screen_pos, world_pos] = this.editor_space.get_cursor_pos(e)
                        this.cursor_world_pos = world_pos;
                        if (this.input_manager.get_keybind_state("PanCamera")) {
                            this.editor_space.camera.move({
                                x: -e.movementX / this.editor_space.camera.zoom,
                                y: -e.movementY / this.editor_space.camera.zoom
                            });
                            return;
                        }
    
                        this.tool_controller.current_tool?.onMoveCursor(world_pos, {x: e.movementX, y: e.movementY}, this.scene_controller.node_controller.nodes);
                    }
                }
        ));
        this.input_manager.set_event_handler(
            InputEvents.CLICK_ON_NODE,
            new EventHandler("onClickOnNode", (data) => {
                if (data.node != null) {
                    this.tool_controller.current_tool?.onClickOnNode(data.node);
                }
            })
        );

        this.input_manager.set_event_handler(
            InputEvents.CLICK_ON_NODE_SLOT,
            new EventHandler("onClickOnSlot", (data) => {
                if (data.slot != null) {
                    this.tool_controller.current_tool?.onClickOnNodeSlot(data.slot);
                }
            })
        );

        this.input_manager.set_event_handler(
            InputEvents.HOVER_NODE,
            new EventHandler("onHoverNode", (data) => {
                if (data.node != null) {
                    this.tool_controller.current_tool?.onHoverNode(data.node);
                }
            })
        );

        this.input_manager.set_event_handler(
            InputEvents.HOVER_SLOT,
            new EventHandler("onHoverSlot", (data) => {
                if (data.slot != null) {
                    this.tool_controller.current_tool?.onHoverSlot(data.slot);
                }
            })
        );

        this.input_manager.set_event_handler(
            InputEvents.HOVER_BACKGROUND,
            new EventHandler("onHoverBackground", (data) => {
                this.tool_controller.current_tool?.onHoverBackground();
            })
        );
    }

    public View() {
        let viewportRef: HTMLDivElement | undefined;
        const selector = new NodeTypeSelector();

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
                        'move-mode': this.input_manager.get_keybind_state("PanCamera"),
                        'moving-mode': this.selection_controller.moving
                    }}

                    oncontextmenu={(e) => {e.preventDefault()}}
                    tabindex="0"
                    onKeyDown={(e) => this.input_manager.onKeyDown(e)}
                    onKeyUp={(e) => this.input_manager.onKeyUp(e)}
                    onWheel={(e) => this.input_manager.onWheel(e)}

                    onPointerMove={(e) => this.input_manager.generalizedEventHandler({event: e}, InputEvents.POINTER_MOVING)}
                    onPointerDown={(e) => this.input_manager.onPointerDown(e)} 
                    onPointerUp={(e) => this.input_manager.onPointerUp(e)} 
                    onPointerLeave={(e) => this.input_manager.onPointerUp(e)}
                    onMouseOver={() => {
                        this.input_manager.generalizedEventHandler({}, InputEvents.HOVER_BACKGROUND)
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
                            <For each={this.scene_controller.connection_controller.connections}>
                                {(conn) => <ConnectionLines 
                                    connection={conn} 
                                    onDisconnect={() => this.scene_controller.connection_controller.disconnect_nodes(conn)} 
                                />}
                            </For>
                            
                            <Show when={this.scene_controller.connection_controller.selected_slot}>
                                <ConnectionPreview start_slot={this.scene_controller.connection_controller.selected_slot} hovered_slot={this.scene_controller.connection_controller.hovered_slot} cursor_pos={this.cursor_world_pos}/>
                            </Show>
                        </svg>

                        <For each={this.scene_controller.node_controller.nodes}>
                            {(node) => {
                                return (node.View(
                                    this.editor_space.camera, 
                                    // TODO: Implement these as EventHandlers on InputManager
                                    (node: BaseNode) => {
                                        this.input_manager.generalizedEventHandler({node: node}, InputEvents.CLICK_ON_NODE)
                                    },
                                    (slot: NodeSlot) => {
                                        this.input_manager.generalizedEventHandler({slot: slot}, InputEvents.CLICK_ON_NODE_SLOT)
                                    },
                                    (node: BaseNode) => {
                                        this.input_manager.generalizedEventHandler({node: node}, InputEvents.HOVER_NODE)
                                    },
                                    (slot: NodeSlot) => {
                                        this.input_manager.generalizedEventHandler({slot: slot}, InputEvents.HOVER_SLOT)
                                    })
                                )
                            }}
                        </For>
                    </div>
                </div>
                
                <div class="editor-ui" onPointerMove={(e) => this.input_manager.generalizedEventHandler({event: e}, InputEvents.POINTER_MOVING)}>
                    <div class="left-tab">
                        {selector.View(this.scene_controller)}
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