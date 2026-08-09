import { onMount, onCleanup, Show, For } from "solid-js";
import { useDocs } from "~/editor/controllers/docs-controller";
import { InputEvents } from "~/editor/internal/input_manager/event-handling";
import { NodeEditor } from "~/editor/node-editor";
import { ConnActionUtils } from "~/network/controllers/actions/conn-actions";
import { NodeActionUtils } from "~/network/controllers/actions/node-actions";
import { NodeParameter } from "~/wrapper/nodes/data/node-data";
import { GraphNode } from "~/wrapper/nodes/graph-node";
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot";
import { DocsElementIndicator } from "../components/docs/selected-docs-indicator";
import { ConnectionLines, ConnectionPreview } from "../editor/components/misc/connection-lines";
import { NodeComponent } from "../editor/components/node/node-component";
import { EditorLeftTabHolder } from "../editor/left-tab";
import { EditorMidTab } from "../editor/mid-tab";
import { EditorRightPanel } from "../editor/right-tab";
import { NodeTypeSelector, SelectedNodeType } from "../editor/subpanels/node-type-selector";
import { DocsView } from "./docs/docs-view";
import MinimizeIcon from '~/assets/icons/minimize.svg';
import { PageViewer } from "../components/page-controller";
import { session_controller } from "~/singletons/user_session";

export const EditorView = (props: {
    editor: NodeEditor
}) => {
    const editor = props.editor;
    const docs = useDocs();
    editor._set_docs_controller(docs);
    const main_page_viewer = new PageViewer();
    
    let viewportRef: HTMLDivElement | undefined;
    let world_space_ref: HTMLDivElement | undefined;
    let editor_view_ref: HTMLDivElement | undefined;
    const selector = new NodeTypeSelector();

    // FIXME: Implement a better way of indexing pages on a pageviewer and accessing them
    const DocsCallback = () => <DocsView scene_controller={editor.scene_controller}/>;
    const docsPage = {
        page_title: "Documentation",
        view_displayer_css: "docs-view",
        icon_element: () => <MinimizeIcon class="small-icon"/>,
        element: DocsCallback
    };

    const openDocsPage = () => {
        main_page_viewer.current_page = docsPage;
    }

    const isDocsPageVisible = () => main_page_viewer.current_page === docsPage;
    
    onMount(() => {
        if (viewportRef) {
            const rect = viewportRef.getBoundingClientRect();
            editor.editor_space.camera.size = { x: rect.width, y: rect.height };
            const resizeObserver = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    const { width, height } = entry.contentRect;
                    editor.editor_space.camera.size = { x: width, y: height };
                }
            });
            
            resizeObserver.observe(viewportRef);
            onCleanup(() => resizeObserver.disconnect());
        }

        if (docs.docs_path) {
            openDocsPage();
        }
    });

    return (
        <div 
            class="editor-view"
            ref={editor_view_ref}
            onPointerUp={(e) => {editor.input_manager.onPointerUp(e); editor.tool_controller.current_tool?.globalOnPointerUp(e)}}
            onPointerDown={(e) => {editor.tool_controller.current_tool?.globalOnPointerDown(e)}}
            onPointerMove={(e) => editor.tool_controller.current_tool?.globalOnPointerMove(e)}
        >
            <div 
                ref={viewportRef} 
                class="viewport"
                style={{
                    position: "absolute", 
                    height: "100vh", 
                    width: "100vw"
                }}
                classList={{
                    'move-mode': editor.input_manager.get_keybind_state("PanCamera"),
                    'moving-mode': editor.selection_controller.moving
                }}

                oncontextmenu={(e) => {e.preventDefault()}}
                tabindex="0"
                onKeyDown={(e) => editor.input_manager.onKeyDown(e)}
                onKeyUp={(e) => editor.input_manager.onKeyUp(e)}
                onWheel={(e) => editor.input_manager.onWheel(e)}

                onPointerMove={(e) => editor.input_manager.generalizedEventHandler({event: e}, InputEvents.POINTER_MOVING)}
                onPointerDown={(e) => editor.input_manager.onPointerDown(e)} 

                onPointerLeave={(e) => editor.input_manager.onPointerUp(e)}
                onMouseOver={() => {
                    editor.input_manager.generalizedEventHandler({}, InputEvents.HOVER_BACKGROUND)
                }}
            >
                <div 
                    style={{
                    position: "absolute",
                    inset: 0,
                    "pointer-events": "none"
                }}>
                    {editor.editor_grid.View(editor.editor_space.camera)}
                </div>
                
                <div 
                    ref={world_space_ref}
                    class="world-space"
                    style={{
                        "transform-origin": "0 0",
                        transform: `translate(${-editor.editor_space.camera.offset.x * editor.editor_space.camera.zoom}px, ${-editor.editor_space.camera.offset.y * editor.editor_space.camera.zoom}px) scale(${editor.editor_space.camera.zoom})`,
                        position: "absolute",
                    }}
                >
                    <Show when={editor.selection_controller.selection_rect.active}>
                        {editor.selection_controller.selection_rect.View()}
                    </Show>
                    <svg style={{
                        position: "absolute",
                        inset: 0,
                        overflow: "visible",
                        "pointer-events": "none",
                    }}>
                        <For each={editor.scene_controller.connection_controller.connections}>
                            {(conn) => <ConnectionLines 
                                connection={conn} 
                                onDisconnect={() => {
                                    ConnActionUtils.request_disconnect([conn], editor._action_controller);
                                }} 
                            />}
                        </For>
                        
                        <Show when={editor.selection_controller.selected_slot}>
                            <ConnectionPreview start_slot={editor.selection_controller.selected_slot} hovered_slot={editor.selection_controller.hovered_slot} cursor_pos={editor.cursor_world_pos}/>
                        </Show>
                    </svg>
                    
                    <SelectedNodeType world_mouse_pos={editor.cursor_world_pos} scene_controller={editor.scene_controller} selection_controller={editor.selection_controller}/>
                    <For each={editor.scene_controller.node_controller.nodes}>
                        {(node) => <NodeComponent 
                                node={node}
                                notification_controller={session_controller.notification_controller}
                                workspace={session_controller.user_workspace}
                                camera={editor.editor_space.camera}
                                onClick={(node: GraphNode) => {
                                    editor.input_manager.generalizedEventHandler({node: node}, InputEvents.CLICK_ON_NODE)
                                }}
                                onClickSlot={(slot: NodeSlot) => {
                                    editor.input_manager.generalizedEventHandler({slot: slot}, InputEvents.CLICK_ON_NODE_SLOT)
                                }}
                                onHoverSlot={(slot: NodeSlot) => {
                                    editor.input_manager.generalizedEventHandler({slot: slot}, InputEvents.HOVER_SLOT)
                                }}
                                onHoverNode={(node: GraphNode) => {
                                    editor.input_manager.generalizedEventHandler({node: node}, InputEvents.HOVER_NODE)
                                }}
                                syncParameter={(node: GraphNode, parameter: NodeParameter) => {
                                    // TODO: Update only this parameter instead of the whole node
                                    NodeActionUtils.request_update_nodes([node], editor._action_controller);
                                }}
                            />
                        }
                    </For>
                </div>
            </div>
            <div 
                class="editor-ui" 
                onPointerMove={(e) => editor.input_manager.generalizedEventHandler({event: e}, InputEvents.POINTER_MOVING)}
            >
                <EditorLeftTabHolder node_type_selector={selector} main_page_viewer={main_page_viewer} editor={editor}/>
                <EditorMidTab docs_page={docsPage} page_viewer={main_page_viewer} editor={editor}/>
                <EditorRightPanel editor={editor} state_controller={editor._state_controller}/>
            </div>
            <DocsElementIndicator open_docs_page={openDocsPage} docsPageVisible={isDocsPageVisible} input_manager={editor.input_manager} tool_controller={editor.tool_controller} editor_camera={editor.editor_space.camera} world_space_ref={world_space_ref} editor_view_ref={editor_view_ref}/>
        </div>
    );
}