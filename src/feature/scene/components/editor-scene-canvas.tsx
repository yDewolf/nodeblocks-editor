import { For, onCleanup, onMount, ParentComponent, Show } from "solid-js";
import { useSceneCanvas } from "../scene-canvas-context"
import {} from "~/feature/ui-themes";
import { EventHandler, InputEvents } from "~/utils/events/event-handling";
import { ConnectionLines, ConnectionPreview } from "~/feature/scene/components/connection-lines";
import { useScene } from "../scene-context";
import { RemoveConnectionsAction } from "~/feature/editor/actions/conn/remove-conns-action";
import { InputScope, useInputContext, useInputManager, useKeybind } from "~/utils/keybinds/input-provider";
import { KeybindTrigger, MouseButton } from "~/utils/keybinds/keybind-trigger";
import { useEventManager } from "~/utils/events/event-provider";
import { SelectedNodeType } from "~/feature/editor/components/subpanels/component/node-type-selector";
import { GridView } from "~/feature/scene/components/grid-view";
import { NodeComponent } from "./node/node-component";
import { ContextMenuController, contextMenuManager } from "~/feature/context-menu/context-menu-controller";
import { CanvasContextMenuController } from "../controllers/canvas-context-menu-controller";
import { useEditor } from "~/feature/editor/contexts/scene-editor-context";

export const EditorSceneCanvas = (props: {
    setWorldSpaceRef: (ref: HTMLDivElement | undefined) => void
}) => {
    const editor = useEditor();
    const inputManager = useInputManager();
    const scene = useScene();
    const scene_canvas = useSceneCanvas();
    let viewportRef: HTMLDivElement | undefined;

    onMount(() => {
        if (viewportRef) {
            const rect = viewportRef.getBoundingClientRect();
            editor.selectionController.space.camera.size = { x: rect.width, y: rect.height };
            const resizeObserver = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    const { width, height } = entry.contentRect;
                    editor.selectionController.space.camera.size = { x: width, y: height };
                }
            });
            
            resizeObserver.observe(viewportRef);
            onCleanup(() => resizeObserver.disconnect());
        }
    });

    const contextMenuController = new CanvasContextMenuController(
        editor.selectionController,
        editor.actionController,
        editor.stateController,
        editor.sceneConnection,
        inputManager
    );

    return (
        <InputScope name="SceneCanvas">
            <SceneCanvasKeybindsAndEvents contextMenuController={contextMenuController}/>
            <div 
                ref={viewportRef}
                class="viewport"
                style={{
                    position: "absolute", 
                    height: "100vh", 
                    width: "100vw"
                }}
                classList={{
                    'move-mode': inputManager.getKeybindState("PreparePanCamera"),
                    'moving-mode': editor.selectionController.moving || inputManager.getKeybindState("PanCamera")
                }}

                tabindex="0"
                // oncontextmenu={(e) => {e.preventDefault()}}
                
                // FIXME: impedir que o contextmenu abra se alguma ferramenta
                // estiver ativada (SecondaryToolAction) 
                oncontextmenu={(e) => inputManager.onContextMenu(e)}
                onKeyDown={(e) => inputManager.onKeyDown(e)}
                onKeyUp={(e) => inputManager.onKeyUp(e)}
                onWheel={(e) => {
                    inputManager.onWheel(e);
                    e.preventDefault();
                }}

                onPointerMove={(e) => editor.eventManager.generalizedEventHandler({event: e}, InputEvents.POINTER_MOVING)}
                onPointerDown={(e) => inputManager.onPointerDown(e)} 
                onPointerUp={(e) => inputManager.onPointerUp(e)}

                onPointerLeave={(e) => inputManager.onPointerUp(e)}
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
                    <GridView camera={scene_canvas.canvasSpace.camera} grid={scene_canvas.canvasSpace.grid}/>
                </div>
                
                <div 
                    ref={(ref) => props.setWorldSpaceRef(ref)}
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
                    
                    <SelectedNodeType node_pos={editor.selectionController.space.cursorWorldPos}/>
                    <For each={Object.values(scene_canvas.nodes)}>
                        {(node) => <NodeComponent node={node}/>}
                    </For>
                </div>
            </div>
        </InputScope>
    )
}


export const SceneCanvasKeybindsAndEvents: ParentComponent<{
    contextMenuController: CanvasContextMenuController,
}> = (props) => {
    const scene_canvas = useSceneCanvas();
    const inputManager = useInputManager();
    const eventManager = useEventManager();

    useInputContext()?.setContextHandler((e) => {
        e.preventDefault();
        contextMenuManager.open(e, props.contextMenuController.contextItems)
    })

    useKeybind(
        "PanCamera", 
        [
            new KeybindTrigger({ mouseButtons: [MouseButton.Left], keys: ["Space"] }),
            new KeybindTrigger({ mouseButtons: [MouseButton.Middle]}),
        ],
        {
            pressed_updateEventState: (e) => {
                e.blockNextKeybinds();
            }
        }
    )

    useKeybind("PreparePanCamera",
        new KeybindTrigger({keys: ["Space"]}),
        {}
    )

    eventManager?.setEventHandler(
        InputEvents.POINTER_MOVING,
        "PanCameraHandler",
        new EventHandler("handleCameraPan", (data) => {
            const e = data.event;
            if (e instanceof PointerEvent) {
                if (inputManager.getKeybindState("PanCamera")) {
                    scene_canvas.canvasSpace.camera.move({
                        x: -e.movementX / scene_canvas.canvasSpace.camera.zoom,
                        y: -e.movementY / scene_canvas.canvasSpace.camera.zoom
                    });
                    e.stopPropagation();
                    return;
                }
            }
        })
    )

    useKeybind(
        "Zoom",
        new KeybindTrigger({ isWheel: true, modifiers: {ctrl: true} }),
        {handle_just_activated: (e) => {
            e.nativeEvent.preventDefault();
        },
        handle_while_active: (event) => {
            const e = event.nativeEvent;
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
        {handle_while_active: (event) => {
            const e = event.nativeEvent;
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
        {handle_while_active: (event) => {
            const e = event.nativeEvent;
            if (e instanceof WheelEvent) {
                scene_canvas.canvasSpace.camera.addOffset({
                    x: e.deltaX,
                    y: e.deltaY
                });
            }
        }, handle_just_activated: 
            (e) => {
                e.nativeEvent.preventDefault();
        }}
    )

    return <></>
}