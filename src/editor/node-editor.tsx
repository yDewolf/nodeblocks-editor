import { EditorSpace } from "./internal/editor-space";
import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { GraphNode } from "../wrapper/nodes/graph-node";
import { NodeSlot } from '../wrapper/nodes/slot/node-slot';
import { Vector2 } from '../wrapper/data_types/geometry';
import { KeyEventManager as GeneralEventManager } from "./internal/input_manager/input-manager";
import { Keybind, KeybindMap, KeyModifiers, MouseButtons } from "./internal/input_manager/keybind-events";
import { EventHandler, InputEvents } from "./internal/input_manager/event-handling";
import { SceneController } from "../wrapper/controllers/scene-controller";
import { ToolController } from "./controllers/tool-controller";
import { SelectionController } from "./controllers/selection-controller";
import { NodeTypeSelector } from "./ui/panels/type_selector/node-type-selector";
import { ConnectionLines, ConnectionPreview } from "./ui/misc/connection-lines";
import { Grid } from "./ui/misc/grid";
import { NodeComponent } from './ui/node/node-component';
import { ServerPanel } from "./ui/panels/server-panel";
import { ServerMessages } from "~/network/websocket/websocket-protocol";
import { StateController } from "~/network/controllers/state_controller";
import { WebsocketStatusController } from "~/network/controllers/status_controller";
import { ServerSyncController } from "~/network/controllers/sync_controller";
import { ActionController } from "~/network/controllers/actions/action-controller";
import { NodeSceneRequestData } from "~/network/websocket/request-types";
import { NodeActionUtils } from "~/network/controllers/actions/node-actions";
import { ConnActionUtils } from "~/network/controllers/actions/conn-actions";
import { NodeParameter } from "~/wrapper/nodes/data/node-data";
import { EditorLeftTabHolder } from './ui/panels/left-tab';
import { SessionController } from "~/network/session/session-controller";
import { SidebarNotifications } from "./ui/misc/notification/notification-badges";
import "~/style/screens/editor.css";

export class NodeEditor {
    scene_controller: SceneController;
    _session_controller: SessionController;
    
    _state_controller: StateController
    _status_controller: WebsocketStatusController
    
    _sync_controller: ServerSyncController
    _action_controller: ActionController

    tool_controller: ToolController

    selection_controller: SelectionController
    input_manager: GeneralEventManager

    editor_space: EditorSpace
    editor_grid: Grid

    private _cursor_world_pos: () => Vector2;
    private _set_cursor_world_pos: (v: Vector2) => void;

    constructor (session_controller: SessionController) {
        this._session_controller = session_controller;
        this._session_controller.notification_controller._editor = this;

        this._state_controller = new StateController(this._editor_client);
        this._status_controller = new WebsocketStatusController(this._editor_client);
        
        this._action_controller = new ActionController(this._editor_client, this);
        this.scene_controller = new SceneController(this._action_controller);
        this._sync_controller = new ServerSyncController(this._editor_client, this.scene_controller)

        const [cursorWorldPos, setCursorWorldPos] = createSignal({x: 0, y: 0});
        this._cursor_world_pos = cursorWorldPos;
        this._set_cursor_world_pos = setCursorWorldPos;

        this.input_manager = new GeneralEventManager();

        this.editor_space = new EditorSpace()
        this.editor_grid = new Grid({x: 32, y: 32});

        this.selection_controller = new SelectionController(this.editor_space, this.editor_grid, this);
        this.tool_controller = new ToolController(this);

        
        this.setup_event_handlers();
        this.setup_keybinds();
        this.setup_message_handlers();
    }

    get _editor_client() { return this._session_controller.client; }

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
                    // const [screen_pos, world_pos] = this.editor_space.get_cursor_pos(e)
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

                    let nodes: NodeSceneRequestData = {};
                    nodes[crypto.randomUUID()] = {
                        type: this.selection_controller.selected_node_type, 
                        position: {x: world_pos.x, y: world_pos.y},
                        data: new Map()
                    };
                    NodeActionUtils.request_add_nodes(nodes, this._action_controller);
                    // TODO: Warn the user about some node construct error
                    // this.scene_controller.node_controller.add_new_node()
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
                if (this.tool_controller.selection_controller.selected_nodes.length > 0) {
                    NodeActionUtils.request_remove_nodes(
                        this.tool_controller.selection_controller.selected_nodes,
                        this._action_controller
                    );
                }
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
                if (data.slot) {
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
                if (data.slot) {
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
        this._editor_client.add_handler(ServerMessages.SYNC_VERSIONS, (message) => {
            console.log("DEBUG: Parsing Type Data: ", message.types);
            if (message.types) {
                this.scene_controller.load_node_type_data(message.types);
            }

            // Sync after the types are loaded btw
            this._sync_controller.sync_with_server_scene()
        });
            
        this._editor_client.add_handler(ServerMessages.NODE_OUTPUT, (message) => {
            this.scene_controller.node_controller.nodes.forEach((node: GraphNode) => {
                node.is_current_step = false;
            })
            // console.log(message);
            const node = this.scene_controller.node_controller.get_node(message.node_id);
            if (node == undefined) {
                console.error("ERROR: Couldn't find node with id ", message.node_id);
                return;
            }
            const node_output: Map<string, Map<string, any>> = new Map(
                Object.entries(message.value).map(([slot_id, slot_output]: [string, any]) => {
                    return [slot_id, slot_output];
                })
            );
            // console.log(message);
            node_output.forEach((value, slot_id) => {
                const slot = node.get_slot(slot_id);
                if (slot) {
                    slot.last_output = value;
                }
            });
            node.is_current_step = true;
            node.last_output = node_output;
        });
    }

    public View() {
        let viewportRef: HTMLDivElement | undefined;
        onMount(() => {
            if (viewportRef) {
                const rect = viewportRef.getBoundingClientRect();
                this.editor_space.camera.size = { x: rect.width, y: rect.height };
                const resizeObserver = new ResizeObserver((entries) => {
                    for (let entry of entries) {
                        const { width, height } = entry.contentRect;
                        this.editor_space.camera.size = { x: width, y: height };
                    }
                });

                resizeObserver.observe(viewportRef);
                onCleanup(() => resizeObserver.disconnect());
            }
        });

        const selector = new NodeTypeSelector();
        return (
            <div 
                class="editor-view"
                onPointerUp={(e) => this.input_manager.onPointerUp(e)} 
            >
                <div 
                    ref={viewportRef} 
                    class="viewport"
                    style={{
                        position: "absolute", 
                        height: "100vh", 
                        width: "100vw"
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
                        style={{
                            "transform-origin": "0 0",
                            transform: `translate(${-this.editor_space.camera.offset.x * this.editor_space.camera.zoom}px, ${-this.editor_space.camera.offset.y * this.editor_space.camera.zoom}px) scale(${this.editor_space.camera.zoom})`,
                            position: "absolute",
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
                                    onDisconnect={() => {
                                        ConnActionUtils.request_disconnect([conn], this._action_controller);
                                    }} 
                                />}
                            </For>
                            
                            <Show when={this.selection_controller.selected_slot}>
                                <ConnectionPreview start_slot={this.selection_controller.selected_slot} hovered_slot={this.selection_controller.hovered_slot} cursor_pos={this.cursor_world_pos}/>
                            </Show>
                        </svg>

                        <For each={this.scene_controller.node_controller.nodes}>
                            {(node) => <NodeComponent 
                                    node={node}
                                    notification_controller={this._session_controller.notification_controller}
                                    workspace={this._session_controller.user_workspace}
                                    camera={this.editor_space.camera}
                                    onClick={(node: GraphNode) => {
                                        this.input_manager.generalizedEventHandler({node: node}, InputEvents.CLICK_ON_NODE)
                                    }}
                                    onClickSlot={(slot: NodeSlot) => {
                                        this.input_manager.generalizedEventHandler({slot: slot}, InputEvents.CLICK_ON_NODE_SLOT)
                                    }}
                                    onHoverSlot={(slot: NodeSlot) => {
                                        this.input_manager.generalizedEventHandler({slot: slot}, InputEvents.HOVER_SLOT)
                                    }}
                                    onHoverNode={(node: GraphNode) => {
                                        this.input_manager.generalizedEventHandler({node: node}, InputEvents.HOVER_NODE)
                                    }}
                                    syncParameter={(node: GraphNode, parameter: NodeParameter) => {
                                        // TODO: Update only this parameter
                                        NodeActionUtils.request_update_nodes([node], this._action_controller);
                                    }}
                                />
                            }
                        </For>
                    </div>
                </div>
                
                <div class="editor-ui" onPointerMove={(e) => this.input_manager.generalizedEventHandler({event: e}, InputEvents.POINTER_MOVING)}>
                    <EditorLeftTabHolder node_type_selector={selector} scene_controller={this.scene_controller} tool_controller={this.tool_controller}/>
                    <div class="middle-tab-holder">
                        <div class="middle-tab-overlay container">
                            <SidebarNotifications notification_controller={this._session_controller.notification_controller}/>
                        </div>
                        <div class="middle-tab container">
                            {this.tool_controller.View()}
                        </div>
                    </div>
                    <div class="right-tab container padded">
                        <ServerPanel editor={this} state_controller={this._state_controller}/>
                    </div>
                </div>
            </div>
        );
    }
}