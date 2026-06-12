import { createEffect, createSignal, JSX, Show, createMemo, onCleanup } from 'solid-js';
import { Portal } from 'solid-js/web';
import { useDocs } from '~/editor/controllers/docs-controller';
import { ToolController } from "~/editor/controllers/tool-controller";
import { EditorCamera } from '~/editor/internal/editor-space';
import { DocsTool } from "~/editor/tools/docs-tool";

export const DocsElementIndicator = (props: {tool_controller: ToolController, editor_camera: EditorCamera, world_space_ref?: HTMLDivElement}) => {
    const docs = useDocs();
    const [style, setStyle] = createSignal<JSX.CSSProperties>({});
    const target = createMemo(() => {
        const hovered_element = docs.hoveredDocElement();
        return hovered_element != null ? hovered_element : docs.selectedDocElement();
    });

    const isInsideGraph = createMemo(() => {
        const element = target();
        if (!element || !props.world_space_ref) return false;
        return props.world_space_ref.contains(element);
    });

    const updatePosition = (target_element: HTMLElement) => {
        const rect = target_element.getBoundingClientRect();

        if (isInsideGraph() && props.world_space_ref) {
            const canvasRect = props.world_space_ref.getBoundingClientRect();
            setStyle({
                position: "absolute",
                top: `${(rect.top - canvasRect.top) / props.editor_camera.zoom}px`,
                left: `${(rect.left - canvasRect.left) / props.editor_camera.zoom}px`,
                width: `${rect.width / props.editor_camera.zoom}px`,
                height: `${rect.height / props.editor_camera.zoom}px`,
                opacity: 1,
                "z-index": 9999
            });
            return;
        }
        setStyle({
            position: "fixed",
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            opacity: 1,
            "z-index": 99999
        });
    };

    createEffect(() => {
        const target_element = target();
        if (!target_element) {
            setStyle({ opacity: 0 });
            return;
        }

        updatePosition(target_element);
        const resizeObserver = new ResizeObserver(() => {
            updatePosition(target_element);
        });
        
        resizeObserver.observe(target_element);
        
        onCleanup(() => {
            resizeObserver.disconnect();
        });
    });

    return (
        <Show when={target() != null && props.tool_controller.current_tool instanceof DocsTool}>
            <Portal mount={isInsideGraph() ? props.world_space_ref : document.body}>
                <div 
                    class="selected-docs-indicator" 
                    classList={{"in-graph": isInsideGraph()}}
                    style={style()} 
                />
            </Portal>
        </Show>
    );
};