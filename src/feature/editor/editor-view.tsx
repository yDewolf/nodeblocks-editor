
import { PageViewer } from '~/components/page-controller';
import { EditorSceneCanvas } from '../scene/components/editor-scene-canvas';
import { useEditor } from '../scene-editor-context';
import { InputEvents } from '~/utils/events/event-handling';
import { EditorLeftTabHolder } from './components/subpanels/left-tab';
import { EditorMidTab } from './components/subpanels/mid-tab';
import { EditorRightPanel } from './components/subpanels/right-tab';
import { SceneCanvasProvider } from '../scene/scene-canvas-context';
import { SceneProvider } from '../scene/scene-context';
import { SceneRuntimeProvider } from '../scene/scene-runtime-context';
import { NotificationProvider } from './contexts/notification-context';
import { EditorDocsView } from '../docs/docs-view';
import MinimizeIcon from '~/assets/icons/minimize.svg';
import { createEffect, createSignal, onMount } from 'solid-js';
import { useDocs } from '../docs/docs-context';
import { DocsElementIndicator } from './components/selected-docs-indicator';
import { editorSettings } from './editor-settings';
import { ClientSceneCommandTypes, CommandGroups } from '~/protocols/nodeblocks/network/client-command-protocol';
import { nanoid } from 'nanoid';
import { editorState, setMainCameraPos, setMainCameraZoom } from './editor-state';
import "~/style/screens/editor.css";

export const EditorView = () => {
    const editor = useEditor();
    const main_page_viewer = new PageViewer();
    
    let editor_view_ref: HTMLDivElement | undefined;
    const [world_space_ref, setWorldSpaceRef] = createSignal<HTMLDivElement | undefined>(undefined);
    
    // FIXME: Implement a better way of indexing pages on a pageviewer and accessing them
    const DocsCallback = () => <EditorDocsView />;
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
    
    const mainSpace = editor.selectionController.space;
    onMount(() => {
        mainSpace.camera.updateOffset(editorState.mainCameraPos ?? {x: 0, y: 0});
        mainSpace.camera.zoom = editorState.mainCameraZoom ?? 1.0;
        
        editor.sceneConnection.sendCommand({
            cmd_uid: nanoid(),
            cmd_group: CommandGroups.SCENE, 
            type: ClientSceneCommandTypes.SET_SCENE_AUTOSAVE, 
            autosave: editorSettings.autosaveScenes
        })
        if (useDocs().is_docs_page_opened) {
            openDocsPage();
        }
    })

    createEffect(() => {
        setMainCameraPos(mainSpace.camera.offset);
        setMainCameraZoom(mainSpace.camera.zoom);
        useDocs().is_docs_page_opened = isDocsPageVisible();
    });

    return (
        <SceneProvider 
            scene={editor.scene} 
            actionController={editor.actionController}
          >
            <SceneRuntimeProvider manager={editor.runtimeController}>
                <NotificationProvider controller={editor.notificationController}>
                    <SceneCanvasProvider canvasSpace={mainSpace} elementController={editor.elementController}>
                        <div 
                            class="editor-view"
                            ref={editor_view_ref}
                            onPointerUp={(e) => {editor.inputManager.onPointerUp(e); editor.toolController.current_tool?.globalOnPointerUp(e)}}
                            onPointerDown={(e) => {editor.toolController.current_tool?.globalOnPointerDown(e)}}
                            onPointerMove={(e) => editor.toolController.current_tool?.globalOnPointerMove(e)}
                            >
                            <EditorSceneCanvas setWorldSpaceRef={setWorldSpaceRef}></EditorSceneCanvas>
                            <div
                                class="editor-ui" 
                                onPointerMove={(e) => editor.eventManager.generalizedEventHandler({event: e}, InputEvents.POINTER_MOVING)}
                                >
                                <EditorLeftTabHolder main_page_viewer={main_page_viewer}/>
                                <EditorMidTab page_viewer={main_page_viewer} docs_page={docsPage}/>
                                <EditorRightPanel/>
                            </div>
                            <DocsElementIndicator open_docs_page={openDocsPage} docsPageVisible={isDocsPageVisible} world_space_ref={world_space_ref()} editor_view_ref={editor_view_ref}/>
                        </div>
                    </SceneCanvasProvider>
                </NotificationProvider>
            </SceneRuntimeProvider>
          </SceneProvider>
    );
}