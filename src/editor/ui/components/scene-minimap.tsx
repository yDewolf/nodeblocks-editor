import { createMemo, createSignal, For } from "solid-js";
import { EditorSpace } from "~/editor/internal/editor-space";
import { GraphNode } from "~/wrapper/nodes/graph-node";

export const SceneMinimap = (props: {
    editor_space: EditorSpace, 
    nodes: GraphNode[]
}) => {
    const [isFittingEverything, setIsFittingEverything] = createSignal(true);
    const cameraBounds = createMemo(() => {
        const camera_rect = props.editor_space.camera.camera_rect;
        let minX = camera_rect.offset.x;
        let minY = camera_rect.offset.y;
        let maxX = camera_rect.offset.x + camera_rect.size.x;
        let maxY = camera_rect.offset.y + camera_rect.size.y;

        let is_fitting: boolean = true;
        props.nodes.forEach(node => {
            if (node.x < minX) {minX = node.x; is_fitting = false};
            if (node.y < minY) {minY = node.y; is_fitting = false};
            if (node.x + node.width > maxX) {maxX = node.x + node.width; is_fitting = false};
            if (node.y + node.height > maxY) {maxY = node.y + node.height; is_fitting = false};
        });
        
        setIsFittingEverything(is_fitting);
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

    return (
        <div class="minimap-container" classList={{"fitting": isFittingEverything()}}>
            <svg 
                viewBox={viewBoxString()} 
                preserveAspectRatio="xMidYMid meet"
                class="minimap-svg"
            >
                <g class="minimap-nodes">
                    <For each={props.nodes}>
                        {(node) => (
                            <rect 
                                x={node.x} 
                                y={node.y} 
                                width={node.width} 
                                height={node.height} 
                                rx={6}
                                classList={{ "selected-node": node.selected }}
                            />
                        )}
                    </For>
                </g>
                <rect 
                    class="minimap-camera"
                    x={props.editor_space.camera.camera_rect.offset.x} 
                    y={props.editor_space.camera.camera_rect.offset.y} 
                    width={props.editor_space.camera.camera_rect.size.x} 
                    height={props.editor_space.camera.camera_rect.size.y} 
                />
            </svg>
        </div>
    );
};