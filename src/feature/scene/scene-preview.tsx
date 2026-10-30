import { For, onCleanup, onMount, Component } from "solid-js";
import { SceneCanvasProvider, useSceneCanvas } from "./scene-canvas-context";
import { ReadonlySceneProvider } from "./scene-context";
import { ConnectionLines } from "./components/connection-lines";
import { GridView } from "./components/grid-view";
import { NodeComponent } from "./components/node/node-component";
import { NodeScene } from "../editor/engine/node_scene";
import { usePackageManager } from "../editor/contexts/package-manager-context";
import { PackageNodeProvider } from "../editor/engine/providers/package-node-provider";
import { SceneData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";
import { SceneMinimapContent } from "./components/scene-minimap";

export const SimplifiedScenePreview: Component<{
    sceneData: SceneData
}> = (props) => {
    const packageManager = usePackageManager();
    const scene = new NodeScene(packageManager.registry, new PackageNodeProvider(packageManager), props.sceneData.uid);
    scene.loadFromSceneData(props.sceneData, true);

    return (
        <ReadonlySceneProvider scene={scene}>
            <SceneCanvasProvider>
                <SceneMinimapContent centerCamera={true}/>
            </SceneCanvasProvider>
        </ReadonlySceneProvider>
    );
}

export const ScenePreview: Component<{
    sceneData: SceneData;
    style?: string | Record<string, string>;
    class?: string;
}> = (props) => {
    const packageManager = usePackageManager();
    const scene = new NodeScene(packageManager.registry, new PackageNodeProvider(packageManager), props.sceneData.uid);
    scene.loadFromSceneData(props.sceneData, true);

    return (
        <ReadonlySceneProvider scene={scene}>
            <SceneCanvasProvider>
                <ScenePreviewViewport style={props.style} class={props.class} />
            </SceneCanvasProvider>
        </ReadonlySceneProvider>
    );
};

const ScenePreviewViewport: Component<{
    style?: string | Record<string, string>; 
    class?: string
}> = (props) => {
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

        scene_canvas.centerCamera();
    });

    return (
        <div 
            ref={viewportRef}
            class={props.class ?? "scene-preview-viewport"}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                ...((typeof props.style === "object" ? props.style : {}) as any)
            }}
        >
            <div 
                style={{
                    position: "absolute",
                    inset: 0,
                    "pointer-events": "none"
                }}
            >
                <GridView camera={scene_canvas.canvasSpace.camera} grid={scene_canvas.canvasSpace.grid}/>
            </div>
            <div 
                class="world-space"
                style={{
                    "transform-origin": "0 0",
                    transform: `translate(${-scene_canvas.canvasSpace.camera.offset.x * scene_canvas.canvasSpace.camera.zoom}px, ${-scene_canvas.canvasSpace.camera.offset.y * scene_canvas.canvasSpace.camera.zoom}px) scale(${scene_canvas.canvasSpace.camera.zoom})`,
                    position: "absolute",
                    "pointer-events": "none",
                }}
            >
                <svg style={{
                    position: "absolute",
                    inset: 0,
                    overflow: "visible",
                    "pointer-events": "none",
                }}>
                    <For each={Object.values(scene_canvas.conns)}>
                        {(conn) => <ConnectionLines connection={conn}/>}
                    </For>
                </svg>
                
                <For each={Object.values(scene_canvas.nodes)}>
                    {(node) => <NodeComponent node={node}/>}
                </For>
            </div>
        </div>
    );
};