import { For, Show } from "solid-js";
import { useSceneCanvas } from "../../scene-canvas-context"
import { NodeComponent } from "~/feature/editor/components/node/node-component";
import "~/app.css";
import "~/style/containers.css";
import "~/style/screens/editor.css";
import {} from "~/feature/ui-themes";
import { useEditor } from "~/feature/scene-editor-context";
import { InputEvents } from "~/utils/input_manager/event-handling";
import { ConnectionLines, ConnectionPreview } from "~/feature/editor/components/canvas/connection-lines";
import { useScene } from "../../scene-context";
import { RemoveConnectionsAction } from "~/feature/editor/actions/conn/remove-conns-action";
import { Keybind, KeybindMap, MouseButtons, KeyModifiers } from "~/utils/input_manager/keybind-events";

export const TestSceneDisplayer = () => {
    const editor = useEditor();
    const scene = useScene();
    const scene_canvas = useSceneCanvas();
    // let viewportRef: HTMLDivElement | undefined;
    
    editor.inputManager.set_keybind_handler(
        new Keybind("PanCamera", [new KeybindMap({keys: new Map([["Space", true]])}), new KeybindMap({mouse_buttons: new Map([[MouseButtons.MIDDLE, true]])})]),
        {}
    );

    editor.inputManager.set_keybind_handler(
        new Keybind("Zoom", [new KeybindMap({mouse_buttons: new Map([[MouseButtons.SCROLL, true]]), modifiers: new Map([[KeyModifiers.CTRL, true]])})]),
        {while_active:
            (data) => {
                data.event.preventDefault();
                const e = data.event;
                if (e instanceof WheelEvent) {
                    // TODO: arrumar um jeito de determinar se a pessoa tá usando touchpad ou não
                    const delta = Math.min(Math.abs(e.deltaY), 0.23) * (-e.deltaY < 0 ? -1 : 1);
                    const new_zoom = Math.max(0.1, Math.min(5.0, scene_canvas.canvasSpace.camera.zoom + delta));
                    const [screen_pos, world_pos] = scene_canvas.canvasSpace.get_cursor_pos(e)
                    
                    scene_canvas.canvasSpace.camera.zoom = new_zoom;
                    scene_canvas.canvasSpace.camera.updateOffset({
                        x: world_pos.x - (screen_pos.x / new_zoom),
                        y: world_pos.y - (screen_pos.y / new_zoom)
                    });
                }
        },
        just_activated: 
            (data) => {
                data.event.preventDefault();
            }
        }
    )

    editor.inputManager.set_keybind_handler(
        new Keybind("SideScroll", [new KeybindMap({mouse_buttons: new Map([[MouseButtons.SCROLL, true]]), modifiers: new Map([[KeyModifiers.SHIFT, true]])})]),
        {while_active:
            (data) => {
                const e = data.event;
                if (e instanceof WheelEvent) {
                    scene_canvas.canvasSpace.camera.addOffset({
                        x: e.deltaY,
                        y: 0
                    });
                }
        }}
    )

    editor.inputManager.set_keybind_handler(
        new Keybind("Scroll", [new KeybindMap({mouse_buttons: new Map([[MouseButtons.SCROLL, true]]), modifiers: new Map([[KeyModifiers.CTRL, false], [KeyModifiers.SHIFT, false]])})]),
        {while_active:
            (data) => {
                const e = data.event;
                if (e instanceof WheelEvent) {
                    scene_canvas.canvasSpace.camera.addOffset({
                        x: e.deltaX,
                        y: e.deltaY
                    });
                }
        }, just_activated: 
            (data) => {
                data.event.preventDefault();
            }    
        }
    )

    return (
        <div 
            // ref={viewportRef}
            class="viewport"
            style={{
                position: "absolute", 
                height: "100vh", 
                width: "100vw"
            }}
            classList={{
                'move-mode': editor.inputManager.get_keybind_state("PanCamera"),
                'moving-mode': editor.selectionController.moving
            }}

            tabindex="0"
            oncontextmenu={(e) => {e.preventDefault()}}
            onKeyDown={(e) => editor.inputManager.onKeyDown(e)}
            onKeyUp={(e) => editor.inputManager.onKeyUp(e)}
            onWheel={(e) => editor.inputManager.onWheel(e)}

            onPointerMove={(e) => editor.inputManager.generalizedEventHandler({event: e}, InputEvents.POINTER_MOVING)}
            onPointerDown={(e) => editor.inputManager.onPointerDown(e)} 

            onPointerLeave={(e) => editor.inputManager.onPointerUp(e)}
            onMouseOver={() => {
                editor.inputManager.generalizedEventHandler({}, InputEvents.HOVER_BACKGROUND)
            }}
        >
            <div 
                style={{
                position: "absolute",
                inset: 0,
                "pointer-events": "none"
            }}>
                {editor.grid.View(scene_canvas.canvasSpace.camera)}
            </div>
            
            <div 
                // ref={world_space_ref}
                class="world-space"
                style={{
                    "transform-origin": "0 0",
                    transform: `translate(${-scene_canvas.canvasSpace.camera.offset.x * scene_canvas.canvasSpace.camera.zoom}px, ${-scene_canvas.canvasSpace.camera.offset.y * scene_canvas.canvasSpace.camera.zoom}px) scale(${scene_canvas.canvasSpace.camera.zoom})`,
                    position: "absolute",
                }}
            >
                <Show when={editor.selectionController.selection_rect.active}>
                    {editor.selectionController.selection_rect.View()}
                </Show>
                <svg style={{
                    position: "absolute",
                    inset: 0,
                    overflow: "visible",
                    "pointer-events": "none",
                }}>
                    <For each={Object.values(scene_canvas.conns)}>
                        {(conn) => <ConnectionLines 
                            connection={conn}
                            onDisconnect={() => {
                                scene.actionController.dispatch(
                                    new RemoveConnectionsAction([conn.uid])
                                )
                            }} 
                        />}
                    </For>
                    
                    <Show when={editor.selectionController.selected_slot}>
                        <ConnectionPreview start_slot={editor.selectionController.selected_slot} hovered_slot={editor.selectionController.hovered_slot} cursor_pos={scene_canvas.canvasSpace.cursorWorldPos}/>
                    </Show>
                </svg>
                
                {/* <SelectedNodeType world_mouse_pos={editor.cursor_world_pos} scene_controller={editor.scene_controller} selection_controller={editor.selection_controller}/> */}
                <For each={Object.values(scene_canvas.nodes)}>
                    {(node) => <NodeComponent 
                            node={node}
                            // notification_controller={session_controller.notification_controller}
                            // workspace={session_controller.user_workspace}
                            // camera={editor.editor_space.camera}
                            // onClick={(node: GraphNode) => {
                            //     editor.input_manager.generalizedEventHandler({node: node}, InputEvents.CLICK_ON_NODE)
                            // }}
                            // onClickSlot={(slot: NodeSlot) => {
                            //     editor.input_manager.generalizedEventHandler({slot: slot}, InputEvents.CLICK_ON_NODE_SLOT)
                            // }}
                            // onHoverSlot={(slot: NodeSlot) => {
                            //     editor.input_manager.generalizedEventHandler({slot: slot}, InputEvents.HOVER_SLOT)
                            // }}
                            // onHoverNode={(node: GraphNode) => {
                            //     editor.input_manager.generalizedEventHandler({node: node}, InputEvents.HOVER_NODE)
                            // }}
                            // syncParameter={(node: GraphNode, parameter: NodeParameter) => {
                            //     // TODO: Update only this parameter instead of the whole node
                            //     NodeActionUtils.request_update_nodes([node], editor._action_controller);
                            // }}
                        />
                    }
                </For>
            </div>
        </div>
    )
}