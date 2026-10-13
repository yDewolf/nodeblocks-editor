import { For, ParentComponent, Show } from "solid-js";
import { useSceneCanvas } from "../../scene-canvas-context"
import { NodeComponent } from "~/feature/editor/components/node/node-component";
import "~/app.css";
import "~/style/containers.css";
import "~/style/screens/editor.css";
import {} from "~/feature/ui-themes";
import { useEditor } from "~/feature/scene-editor-context";
import { EventHandler, InputEvents } from "~/utils/events/event-handling";
import { ConnectionLines, ConnectionPreview } from "~/feature/editor/components/canvas/connection-lines";
import { useScene } from "../../scene-context";
import { RemoveConnectionsAction } from "~/feature/editor/actions/conn/remove-conns-action";
import { InputScope, useInputManager, useKeybind } from "~/utils/keybinds/input-provider";
import { KeybindTrigger, MouseButtons } from "~/utils/keybinds/keybind-trigger";
import { useEventManager } from "~/utils/events/event-provider";

export const TestSceneDisplayer = () => {
    const editor = useEditor();
    const scene = useScene();
    const scene_canvas = useSceneCanvas();
    // let viewportRef: HTMLDivElement | undefined;

    return (
        <InputScope name="SceneCanvas">
            <SceneCanvasKeybindsAndEvents />
            <div 
                // ref={viewportRef}
                class="viewport"
                style={{
                    position: "absolute", 
                    height: "100vh", 
                    width: "100vw"
                }}
                classList={{
                    'move-mode': editor.inputManager.getKeybindState("PanCamera"),
                    'moving-mode': editor.selectionController.moving
                }}

                tabindex="0"
                oncontextmenu={(e) => {e.preventDefault()}}
                onKeyDown={(e) => editor.inputManager.onKeyDown(e)}
                onKeyUp={(e) => editor.inputManager.onKeyUp(e)}
                onWheel={(e) => editor.inputManager.onWheel(e)}

                onPointerMove={(e) => editor.eventManager.generalizedEventHandler({event: e}, InputEvents.POINTER_MOVING)}
                onPointerDown={(e) => editor.inputManager.onPointerDown(e)} 
                onPointerUp={(e) => editor.inputManager.onPointerUp(e)}

                onPointerLeave={(e) => editor.inputManager.onPointerUp(e)}
                onMouseOver={() => {
                    editor.eventManager.generalizedEventHandler({}, InputEvents.HOVER_BACKGROUND)
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
        </InputScope>
    )
}


export const SceneCanvasKeybindsAndEvents: ParentComponent = () => {
    const scene_canvas = useSceneCanvas();
    const inputManager = useInputManager();
    const eventManager = useEventManager();

    useKeybind(
        "PanCamera", 
        new KeybindTrigger({ mouseButtons: [MouseButtons.Middle] }),
        {while_active: (e) => {
            if (e instanceof PointerEvent) {
                scene_canvas.canvasSpace.camera.move({
                    x: -e.movementX / scene_canvas.canvasSpace.camera.zoom,
                    y: -e.movementY / scene_canvas.canvasSpace.camera.zoom
                });
            }
        }}
    )
    eventManager?.addEventHandler(
        InputEvents.POINTER_MOVING,
        new EventHandler("handleCameraPan", (data) => {
            const e = data.event;
            if (e instanceof PointerEvent) {
                if (inputManager.getKeybindState("PanCamera")) {
                    scene_canvas.canvasSpace.camera.move({
                        x: -e.movementX / scene_canvas.canvasSpace.camera.zoom,
                        y: -e.movementY / scene_canvas.canvasSpace.camera.zoom
                    });
                    return;
                }
            }
        })
    )


    useKeybind(
        "Zoom",
        new KeybindTrigger({ isWheel: true, modifiers: {ctrl: true} }),
        {just_activated: (e) => {
            e.preventDefault();
        },
        while_active: (e) => {
            e.preventDefault();
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
        }}
    )

    useKeybind(
        "SideScroll",
        new KeybindTrigger({isWheel: true, modifiers: {shift: true}}),
        {while_active: (e) => {
            if (e instanceof WheelEvent) {
                scene_canvas.canvasSpace.camera.addOffset({
                    x: e.deltaY,
                    y: 0
                });
            }
        }}
    )
    
    useKeybind(
        "Scroll",
        new KeybindTrigger({isWheel: true}),
        {while_active: (e) => {
            if (e instanceof WheelEvent) {
                scene_canvas.canvasSpace.camera.addOffset({
                    x: e.deltaX,
                    y: e.deltaY
                });
            }
        }, just_activated: 
            (e) => {
                e.preventDefault();
        }}
    )

    return <></>
}