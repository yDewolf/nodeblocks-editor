import { createMemo, createSignal, For } from "solid-js";
import { useEditor } from "~/feature/scene-editor-context";

export const SceneMinimap = () => {
    const editor = useEditor();
    const editor_space = editor.selectionController.space;
    const nodes = createMemo(() => Object.values(editor.elementController.nodes));

    const [isFittingEverything, setIsFittingEverything] = createSignal(true);
    const cameraBounds = createMemo(() => {
        const camera_rect = editor_space.camera.camera_rect;
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
                <rect 
                    class="minimap-camera"
                    x={editor_space.camera.camera_rect.offset.x} 
                    y={editor_space.camera.camera_rect.offset.y} 
                    width={editor_space.camera.camera_rect.size.x} 
                    height={editor_space.camera.camera_rect.size.y} 
                />
            </svg>
        </div>
    );
};