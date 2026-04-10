import { EditorSpace } from "./internal/editor-space";
import { createSignal, For, Show } from "solid-js";
import { GraphNode } from "../wrapper/nodes/graph-node";
import { NodeSlot } from '../wrapper/nodes/slot/node-slot';
import { Vector2 } from '../wrapper/data_types/geometry';
import { KeyEventManager as GeneralEventManager } from "./internal/input_manager/input-manager";
import { Keybind, KeybindMap, KeyModifiers, MouseButtons } from "./internal/input_manager/keybind-events";
import { EventHandler, InputEvents } from "./internal/input_manager/event-handling";
import { SceneController } from "../wrapper/controllers/scene-controller";
import { NodeServerClient } from "~/network/websocket-handler";
import { NodeSceneFile } from "~/wrapper/helpers/node-scene-file";
import { ToolController } from "./controllers/tool-controller";
import { SelectionController } from "./controllers/selection-controller";
import { NodeTypeSelector } from "./ui/misc/node-type-selector";
import { ConnectionLines, ConnectionPreview } from "./ui/misc/connection-lines";
import { Grid } from "./ui/misc/grid";
import { NodePreview } from "./ui/misc/node-preview";
import { NodeComponent } from './ui/node/node-component';
import { ServerPanel } from "./ui/panels/server-panel";
import { ClientMessages, InstanceCommands } from "~/network/websocket-protocol";

export class NodeEditor {
    _editor_client: NodeServerClient

    scene_controller: SceneController;
    tool_controller: ToolController

    selection_controller: SelectionController
    input_manager: GeneralEventManager

    editor_space: EditorSpace
    editor_grid: Grid

    private _cursor_world_pos: () => Vector2;
    private _set_cursor_world_pos: (v: Vector2) => void;

    constructor (editor_client: NodeServerClient) {
        this._editor_client = editor_client;
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
        this.setup_message_handlers();
    }

    get cursor_world_pos() { return this._cursor_world_pos(); }
    set cursor_world_pos(v: Vector2) { this._set_cursor_world_pos(v); }

    private setup_keybinds() {
        this.input_manager.set_keybind_handler(
            new Keybind("PanCamera", [new KeybindMap({keys: new Map([["Space", true]])}), new KeybindMap({mouse_buttons: new Map([[MouseButtons.MIDDLE, true]])})]),
            {}
        );

        this.input_manager.set_keybind_handler(
            new Keybind("Zoom", [new KeybindMap({mouse_buttons: new Map([[MouseButtons.SCROLL, true]]), modifiers: new Map([[KeyModifiers.SHIFT, false]])})]),
            {while_active:
                (data) => {
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
        )

        this.input_manager.set_keybind_handler(
            new Keybind("SideScroll", [new KeybindMap({mouse_buttons: new Map([[MouseButtons.SCROLL, true]]), modifiers: new Map([[KeyModifiers.SHIFT, true]])})]),
            {while_active:
                (data) => {
                    const e = data.event;
                    if (e instanceof WheelEvent) {
                        this.editor_space.camera.addOffset({
                            x: e.deltaY,
                            y: 0
                        });
                    }
            }}
        )

        this.input_manager.set_keybind_handler(
            new Keybind("MainToolAction", [new KeybindMap({mouse_buttons: new Map([[MouseButtons.LEFT, true]])})]),
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
            new Keybind("SecondaryToolAction", [new KeybindMap({mouse_buttons: new Map([[MouseButtons.RIGHT, true]])})]),
            {just_activated: (data) => {
                const e = data.event;
                if (e instanceof PointerEvent) {
                    const [screen_pos, world_pos] = this.editor_space.get_cursor_pos(e)
                    if (e.target !== e.currentTarget) return;

                    this.scene_controller.node_controller.add_new_node("", {x: world_pos.x, y: world_pos.y}, this.selection_controller.selected_node_type)
                }
            }}
        );
        
        this.input_manager.set_keybind_handler(
            new Keybind("SaveScene", [new KeybindMap({keys: new Map([["KeyS", true]]), modifiers: new Map([[KeyModifiers.ALT, true]])})]),
            {just_activated: (data) => {
                const scene_data = this.scene_controller.save_scene();
                // console.log(JSON.stringify(scene_data));
                // console.log("data to json", NodeSceneFile.scene_data_to_json(scene_data));
            }}
        );

        this.input_manager.set_keybind_handler(
            new Keybind("DeleteNode", [new KeybindMap({keys: new Map([["Delete", true]]), modifiers: new Map()})]),
            {just_activated: (data) => {
                this.tool_controller.selection_controller.selected_nodes.forEach((node) => {
                    node.get_connections().forEach((conn) => {
                        this.scene_controller.connection_controller.disconnect_nodes(conn);
                    });
                    this.scene_controller.node_controller.remove_node(node);
                });
                // console.log(JSON.stringify(scene_data));
                // console.log("data to json", NodeSceneFile.scene_data_to_json(scene_data));
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

    public setup_message_handlers() {
        this._editor_client.set_handler("handshake_sync", (message) => {
            if (message.type != "handshake_sync") {
                return;
            }
            
            if ("type_data" in message) {
                console.log("DEBUG: Parsing Type Data: ", message.type_data);
                this.scene_controller.load_node_type_data(message.type_data);
            }
        });

        this._editor_client.set_handler("sync_instance_state", (message) => {
            if (message.type != "sync_instance_state") {
                return;
            }

            console.log("DEBUG: Received Sync Instance States", message.payload);
            // TODO: Do something with the new states like update UI, disable actions, etc.
        });

        this._editor_client.set_handler("node_output", (message) => {
            if (message.type != "node_output") {
                return;
            }
            
            const node = this.scene_controller.node_controller.get_node(message.node_id);
            if (node == undefined) {
                console.error("ERROR: Couldn't find node with id ", message.node_id);
                return;
            }
            const node_output: Map<string, Map<string, any>> = new Map(
                Object.entries(message.value).map(([slot_name, slot_data]: [string, any]) => {
                    const slot_output_map = new Map<string, any>(Object.entries(slot_data));
                    return [slot_name, slot_output_map];
                })
            );
            node_output.forEach((value, slot_name) => {
                const slot = node.get_slot(slot_name);
                if (slot) {
                    slot.last_output = value;
                }
            });
            node.last_output = node_output;
        });

        this._editor_client.set_handler("sync_client_scene", (message) => {
            if (message.type != "sync_client_scene") {
                return;
            }

            const scene_data = this.scene_controller.load_scene_data(message.payload);
        });
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
                            {(node) => <NodeComponent 
                                    node={node}
                                    camera={this.editor_space.camera}
                                    onClick={(node: GraphNode) => {
                                        this.input_manager.generalizedEventHandler({node: node}, InputEvents.CLICK_ON_NODE)
                                    }}
                                    onClickOnSlot={(slot: NodeSlot) => {
                                        this.input_manager.generalizedEventHandler({slot: slot}, InputEvents.CLICK_ON_NODE_SLOT)
                                    }}
                                    onHoverNode={(node: GraphNode) => {
                                        this.input_manager.generalizedEventHandler({node: node}, InputEvents.HOVER_NODE)
                                    }}
                                    onHoverSlot={(slot: NodeSlot) => {
                                        this.input_manager.generalizedEventHandler({slot: slot}, InputEvents.HOVER_SLOT)
                                    }}
                                />
                            }
                        </For>
                    </div>
                </div>
                
                <div class="editor-ui" onPointerMove={(e) => this.input_manager.generalizedEventHandler({event: e}, InputEvents.POINTER_MOVING)}>
                    <div class="left-tab">
                        <div class="button-tab column-row">
                            <ul class="tabs">
                                <li class="tab-item">
                                    <input class="visually-hidden" type="file" accept=".json" id="scene-input" onChange={
                                        (e) => {
                                            if (!e.target.files) {
                                                return;
                                            }

                                            let selected_file: File = e.target.files[0];
                                            this.scene_controller.safe_change_scene_file(selected_file);
                                        }
                                    }/>
                                    <label for="scene-input">File</label>
                                </li>
                            </ul>
                        </div>
                        
                        {selector.View(this.scene_controller, (node_preview: NodePreview) => this.tool_controller.current_tool?.onClickOnNodePreview(node_preview))}
                    </div>
                    <div class="middle-tab">
                        {this.tool_controller.View()}
                    </div>
                    <div class="right-tab">
                        <ServerPanel client={this._editor_client} editor={this}/>
                        <div class="input-row">
                            <button onclick={() => {this._editor_client.sendCommand({type: ClientMessages.INSTANCE_COMMAND, payload: {action: InstanceCommands.STEP}})}}>STEP</button>
                            <button onclick={() => {this._editor_client.sendCommand({type: ClientMessages.LOAD_SCENE, payload: NodeSceneFile.scene_data_to_json(this.scene_controller.gen_scene_data())})}}>Send Current Scene</button>
                            <button onclick={() => {this._editor_client.sendCommand({type: ClientMessages.INSTANCE_COMMAND, payload: {action: InstanceCommands.RUN}})}}>Run Instance</button>
                            <button onclick={() => {this._editor_client.sendCommand({type: ClientMessages.INSTANCE_COMMAND, payload: {action: InstanceCommands.STOP}})}}>Stop Instance</button>
                            <button onclick={() => {this._editor_client.sendCommand({type: ClientMessages.SYNC_CLIENT_SCENE})}}>Load Server Scene</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}