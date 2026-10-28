import { InputManagerProvider, InputScope, useInputContext, useInputManager, useKeybind } from "~/utils/keybinds/input-provider";
import { SceneCanvasProvider, useSceneCanvas } from "./scene-canvas-context";
import { ReadonlySceneProvider, SceneProvider, ensureScene, useSceneReadonly } from "./scene-context";
import { For, onCleanup, onMount, ParentComponent } from "solid-js";
import { CanvasContextMenuController } from "./controllers/canvas-context-menu-controller";
import { contextMenuManager } from "../context-menu/context-menu-controller";
import { useEventManager } from "~/utils/events/event-provider";
import { InputEvents, EventHandler } from "~/utils/events/event-handling";
import { KeybindTrigger, MouseButton } from "~/utils/keybinds/keybind-trigger";
import { ConnectionLines } from "./components/connection-lines";
import { GridView } from "./components/grid-view";
import { NodeComponent } from "./components/node/node-component";
import { NodeScene } from "../editor/engine/node_scene";
import { usePackageManager } from "../editor/contexts/package-manager-context";
import { PackageNodeProvider } from "../editor/engine/providers/package-node-provider";
import { SceneData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";
import { InputManager } from "~/utils/keybinds/input-manager";

export const SceneCanvasSetup = (props: {
    sceneData: SceneData,
    centerCamera?: boolean
}) => {
    const packageManager = usePackageManager();
    const scene = new NodeScene(packageManager.registry, new PackageNodeProvider(packageManager), props.sceneData.uid);
    scene.loadFromSceneData(props.sceneData, true);

    return (
        <InputManagerProvider manager={new InputManager()}>
            <ReadonlySceneProvider scene={scene}>
                <SceneCanvasProvider centeredCamera={props.centerCamera}>
                    <SceneCanvas/>
                </SceneCanvasProvider>
            </ReadonlySceneProvider>
        </InputManagerProvider>
    )
}

export const SceneCanvas = (props: {
    setWorldSpaceRef?: (ref: HTMLDivElement | undefined) => void,
}) => {
    const eventManager = useEventManager();
    const inputManager = useInputManager();
    const scene_canvas = useSceneCanvas();
    let viewportRef: HTMLDivElement | undefined;

    onMount(() => {
        if (viewportRef) {
            const rect = viewportRef.getBoundingClientRect();
            scene_canvas.canvasSpace.camera.size = { x: rect.width, y: rect.height };
            const resizeObserver = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    const { width, height } = entry.contentRect;
                    scene_canvas.canvasSpace.camera.size = { x: width, y: height };
                }
            });
            
            resizeObserver.observe(viewportRef);
            onCleanup(() => resizeObserver.disconnect());
        }
    });
    return (
        <InputScope name="SceneCanvas">
            <SceneCanvasKeybindsAndEvents/>
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
                }}
                oncontextmenu={(e) => inputManager.onContextMenu(e)}
                onKeyDown={(e) => inputManager.onKeyDown(e)}
                onKeyUp={(e) => inputManager.onKeyUp(e)}
                onWheel={(e) => {
                    inputManager.onWheel(e);
                    e.preventDefault();
                }}

                onPointerMove={(e) => eventManager?.generalizedEventHandler({event: e}, InputEvents.POINTER_MOVING)}
                onPointerDown={(e) => inputManager.onPointerDown(e)} 
                onPointerUp={(e) => inputManager.onPointerUp(e)}

                onPointerLeave={(e) => inputManager.onPointerUp(e)}
                onMouseOver={() => {
                    eventManager?.generalizedEventHandler({}, InputEvents.HOVER_BACKGROUND)
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
                    ref={(ref) => {props.setWorldSpaceRef?.(ref)}}
                    class="world-space"
                    style={{
                        "transform-origin": "0 0",
                        transform: `translate(${-scene_canvas.canvasSpace.camera.offset.x * scene_canvas.canvasSpace.camera.zoom}px, ${-scene_canvas.canvasSpace.camera.offset.y * scene_canvas.canvasSpace.camera.zoom}px) scale(${scene_canvas.canvasSpace.camera.zoom})`,
                        position: "absolute",
                    }}
                >
                    <svg style={{
                        position: "absolute",
                        inset: 0,
                        overflow: "visible",
                        "pointer-events": "none",
                    }}>
                        <For each={Object.values(scene_canvas.conns)}>
                            {(conn) => <ConnectionLines 
                                connection={conn}
                            />}
                        </For>
                    </svg>
                    
                    <For each={Object.values(scene_canvas.nodes)}>
                        {(node) => <NodeComponent node={node}/>}
                    </For>
                </div>
            </div>
        </InputScope>
    )
}


export const SceneCanvasKeybindsAndEvents: ParentComponent<{
    contextMenuController?: CanvasContextMenuController,
}> = (props) => {
    const scene_canvas = useSceneCanvas();
    const inputManager = useInputManager();
    const eventManager = useEventManager();

    if (props.contextMenuController) {
        useInputContext()?.setContextHandler((e) => {
            if (props.contextMenuController) {
                e.preventDefault();
                contextMenuManager.open(e, props.contextMenuController.contextItems)
            }
        })
    }

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