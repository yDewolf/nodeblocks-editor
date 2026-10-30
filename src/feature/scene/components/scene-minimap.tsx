import { createMemo, createSignal, For, onMount, ParentComponent } from "solid-js";
import { useSceneCanvas } from "~/feature/scene/scene-canvas-context";
import { ConnectionLines } from "./connection-lines";

export const SceneMinimap = () => {
    const scene_canvas = useSceneCanvas();
    const [isFittingEverything, setIsFittingEverything] = createSignal(true);

    return (
        <div class="minimap-container" classList={{"fitting": isFittingEverything()}}>
            <SceneMinimapContent setIsFittingEverything={setIsFittingEverything}>
                <rect 
                    class="minimap-camera"
                    x={scene_canvas.canvasSpace.camera.camera_rect.offset.x} 
                    y={scene_canvas.canvasSpace.camera.camera_rect.offset.y} 
                    width={scene_canvas.canvasSpace.camera.camera_rect.size.x} 
                    height={scene_canvas.canvasSpace.camera.camera_rect.size.y} 
                />
            </SceneMinimapContent>
        </div>
    );
};


export const SceneMinimapContent: ParentComponent<{
    setIsFittingEverything?: (v: boolean) => void,
    centerCamera?: boolean,
    showConnections?: boolean
}> = (props) => {
    const scene_canvas = useSceneCanvas();
    const nodes = createMemo(() => Object.values(scene_canvas.elementController.nodes));

    const cameraBounds = createMemo(() => {
        const camera_rect = scene_canvas.canvasSpace.camera.camera_rect;
        let minX = camera_rect.offset.x;
        let minY = camera_rect.offset.y;
        let maxX = camera_rect.offset.x + camera_rect.size.x;
        let maxY = camera_rect.offset.y + camera_rect.size.y;

        let is_fitting: boolean = true;
        nodes().forEach(node => {
            if (node.position.x < minX) {minX = node.position.x; is_fitting = false};
            if (node.position.y < minY) {minY = node.position.y; is_fitting = false};
            if (node.position.x + node.width > maxX) {maxX = node.position.x + node.width; is_fitting = false};
            if (node.position.y + node.height > maxY) {maxY = node.position.y + node.height; is_fitting = false};
        });
        
        props.setIsFittingEverything?.(is_fitting);
        const padding = 150;
        return {
            x: minX - padding,
            y: minY - padding,
            width: (maxX - minX) + (padding * 2),
            height: (maxY - minY) + (padding * 2)
        };
    });
    
    const viewBoxString = () => {
        const bounds = cameraBounds();
        return `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`;
    };
    
    onMount(() => {
        if (props.centerCamera) {
            scene_canvas.centerCamera();
        }

        Object.values(scene_canvas.elementController.conns).forEach((conn) => {
            scene_canvas.elementController.update_anchors_from_conn(conn);
            scene_canvas.elementController.update_slot_position(conn.input_slot);
            scene_canvas.elementController.update_slot_position(conn.output_slot);
        })
    })

    return (
        <svg 
            viewBox={viewBoxString()} 
            preserveAspectRatio="xMidYMid meet"
            class="minimap-svg"
        >
            <g class="minimap-nodes">
                <For each={nodes()}>
                    {(node) => (
                        <rect 
                            x={node.position.x} 
                            y={node.position.y} 
                            width={node.width} 
                            height={node.height} 
                            rx={6}
                            classList={{ "selected-node": node.isSelected }}
                        />
                    )}
                </For>
            </g>
            <g class="minimap-conns">
                <For each={Object.values(scene_canvas.elementController.conns)}>
                    {(conn) => <ConnectionLines connection={conn}/>}
                </For>
            </g>
            {props.children}
        </svg>
    )
}