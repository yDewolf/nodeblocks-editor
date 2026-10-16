
import MinimizeIcon from '~/assets/icons/minimize.svg';
import { PageViewer } from '~/components/page-controller';
import { EditorSceneCanvas } from '../scene/components/editor-scene-canvas';
import { useEditor } from '../scene-editor-context';
import { InputEvents } from '~/utils/events/event-handling';
import { EditorLeftTabHolder } from './components/subpanels/left-tab';
import { EditorMidTab } from './components/subpanels/mid-tab';
import { EditorRightPanel } from './components/subpanels/right-tab';
import {} from "../ui-themes";
import "~/style/screens/editor.css";
import "~/app.css";
import { SceneCanvasProvider } from '../scene/scene-canvas-context';
import { SceneProvider } from '../scene/scene-context';
import { SceneRuntimeProvider } from '../scene/scene-runtime-context';
import { NotificationProvider } from './contexts/notification-context';

export const EditorView = () => {
    const editor = useEditor();
    const main_page_viewer = new PageViewer();
    
    let editor_view_ref: HTMLDivElement | undefined;
    
    // FIXME: Implement a better way of indexing pages on a pageviewer and accessing them
    // const DocsCallback = () => <DocsView scene_controller={editor.scene_controller}/>;
    // const docsPage = {
    //     page_title: "Documentation",
    //     view_displayer_css: "docs-view",
    //     icon_element: () => <MinimizeIcon class="small-icon"/>,
    //     element: DocsCallback
    // };
    
    // const openDocsPage = () => {
    //     main_page_viewer.current_page = docsPage;
    // }
    
    // const isDocsPageVisible = () => main_page_viewer.current_page === docsPage;    

    // createEffect(() => {
    //     docs.is_docs_page_opened = isDocsPageVisible();
    // });

    return (
        <SceneProvider 
            scene={editor.scene} 
            actionController={editor.actionController}
          >
            <SceneRuntimeProvider manager={editor.runtimeController}>
                <NotificationProvider controller={editor.notificationController}>
                    <SceneCanvasProvider canvasSpace={editor.selectionController.space} elementController={editor.elementController}>
                        <div 
                            class="editor-view"
                            ref={editor_view_ref}
                            onPointerUp={(e) => {editor.inputManager.onPointerUp(e); editor.toolController.current_tool?.globalOnPointerUp(e)}}
                            onPointerDown={(e) => {editor.toolController.current_tool?.globalOnPointerDown(e)}}
                            onPointerMove={(e) => editor.toolController.current_tool?.globalOnPointerMove(e)}
                            >
                            <EditorSceneCanvas></EditorSceneCanvas>
                            <div
                                class="editor-ui" 
                                onPointerMove={(e) => editor.eventManager.generalizedEventHandler({event: e}, InputEvents.POINTER_MOVING)}
                                >
                                <EditorLeftTabHolder main_page_viewer={main_page_viewer}/>
                                <EditorMidTab page_viewer={main_page_viewer}/>
                                <EditorRightPanel/>
                            </div>
                            {/* <DocsElementIndicator open_docs_page={openDocsPage} docsPageVisible={isDocsPageVisible} input_manager={editor.input_manager} tool_controller={editor.tool_controller} editor_camera={editor.editor_space.camera} world_space_ref={world_space_ref} editor_view_ref={editor_view_ref}/> */}
                        </div>
                    </SceneCanvasProvider>
                </NotificationProvider>
            </SceneRuntimeProvider>
          </SceneProvider>
    );
}