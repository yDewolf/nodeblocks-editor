import { createEffect, createSignal, JSX, Show, createMemo, onCleanup } from 'solid-js';
import { Portal } from 'solid-js/web';
import { useDocs } from '~/editor/controllers/docs-controller';
import { ToolController } from "~/editor/controllers/tool-controller";
import { EditorCamera } from '~/editor/internal/editor-space';
import { KeyEventManager } from '~/editor/internal/input_manager/input-manager';
import { DocsTool } from "~/editor/tools/docs-tool";
import DocsIcon from '~/assets/icons/book.svg';
import ExpandIcon from '~/assets/icons/expand.svg';

export const DocsElementIndicator = (props: {
    input_manager: KeyEventManager,
    tool_controller: ToolController, 
    editor_camera: EditorCamera, 
    world_space_ref?: HTMLDivElement,
    open_docs_page: () => void
}) => {
    const docs = useDocs();
    const [style, setStyle] = createSignal<JSX.CSSProperties>({});
    const [popupStyle, setPopupStyle] = createSignal<JSX.CSSProperties>({});
    const target = createMemo(() => {
        const hovered_element = docs.hoveredDocElement();
        return hovered_element != null ? hovered_element : docs.selectedDocElement();
    });

    const isToolActive = () => props.tool_controller.current_tool instanceof DocsTool;
    const selectedMousePos = () => {
        if (props.tool_controller.current_tool instanceof DocsTool) {
            return props.tool_controller.current_tool.last_selected_pos;
        } 
        return undefined;
    }

    const isSelectedInsideGraph = createMemo(() => {
        const element = docs.selectedDocElement();
        if (!element || !props.world_space_ref) return false;
        return props.world_space_ref.contains(element);
    })

    const isInsideGraph = createMemo(() => {
        const element = target();
        if (!element || !props.world_space_ref) return false;
        return props.world_space_ref.contains(element);
    });

    const updatePosition = (target_element: HTMLElement) => {
        const rect = target_element.getBoundingClientRect();
        const mouse_pos = selectedMousePos();
        if (isInsideGraph() && props.world_space_ref) {
            const canvasRect = props.world_space_ref.getBoundingClientRect();
            if (docs.selectedDocElement() == target_element) {
                setPopupStyle({
                    position: "absolute",
                    top: `${(rect.top - canvasRect.top) / props.editor_camera.zoom}px`,
                    left: `${(rect.width + rect.left - canvasRect.left) / props.editor_camera.zoom}px`,
                    "z-index": 10
                });
            }
            
            setStyle({
                position: "absolute",
                top: `${(rect.top - canvasRect.top) / props.editor_camera.zoom}px`,
                left: `${(rect.left - canvasRect.left) / props.editor_camera.zoom}px`,
                width: `${rect.width / props.editor_camera.zoom}px`,
                height: `${rect.height / props.editor_camera.zoom}px`,
                opacity: 1,
                "z-index": 10
            });
            return;
        }
        if (docs.selectedDocElement() == target_element) {
            setPopupStyle({
                position: "fixed",
                top: `${(mouse_pos != undefined ? mouse_pos?.y : rect.top)}px`,
                left: `${mouse_pos != undefined ? mouse_pos?.x : (rect.left + rect.width)}px`,
                "z-index": 11
            });
        }
        setStyle({
            position: "fixed",
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            opacity: 1,
            "z-index": 10
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
        <>
            <Show when={target() != null && isToolActive()}>
                <Portal mount={isInsideGraph() ? props.world_space_ref : document.body}>
                    <div 
                        class="selected-docs-indicator" 
                        classList={{"in-graph": isInsideGraph()}}
                        style={style()} 
                    />
                </Portal>
            </Show>
            <Show when={docs.selectedDocElement() && isToolActive()}>
                {/* FIXME: Teoricamente não é pra deixar o popup em world space, só que assim ele consegue ficar preso ao node, mesmo se a câmera se mover */}
                <Portal mount={isSelectedInsideGraph() ? props.world_space_ref : document.body}>
                    <div 
                        class="container selected-docs-popup" 
                        style={popupStyle()} 
                    >  
                        <div class="fill keep row-container space-between" style={{"align-items": 'center'}}>
                            <DocsIcon class="small-icon"/>
                            {docs.docsData.latest?.data.capitalized_name}
                            <button class="icon-button" onclick={() => {
                                props.open_docs_page()
                            }}>
                                <ExpandIcon class="small-icon"/>
                            </button>
                        </div>
                        <p>
                            {docs.docsData.latest?.data.description != "" ? docs.docsData.latest?.data.description : ""}
                        </p>
                    </div>
                </Portal>
            </Show>
        </>
    );
};
