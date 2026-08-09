import { ThemeButton } from "../components/buttons/theme-button";
import { SceneMinimap } from "../components/scene-minimap";
import { EditorToolbar } from "./subpanels/editor-toolbar";
import { NodeEditor } from "~/editor/node-editor";
import { PageView, PageViewer, StaticViewDisplayer } from '../components/page-controller';
import { Show } from "solid-js";
import DocsIcon from "~/assets/icons/book.svg";

export const EditorMidTab = (props: {page_viewer: PageViewer, editor: NodeEditor, docs_page: PageView}) => {
    
    // FIXME: shouldn't access tool controller for this
    // props.editor.tool_controller.tools.forEach((tool) => {
    //     if (tool instanceof DocsTool) {
    //         tool.onSelectDocumentation = () => props.page_viewer.current_page = page_obj;
    //     }
    // });

    return (
        <div class="middle-tab-holder">
            <Show when={!props.page_viewer.current_page} fallback={
                <StaticViewDisplayer page_viewer={props.page_viewer}/>
            }>
                <div class="middle-tab-overlay container">
                    <div class="keep fill row-container space-between">
                        <div class="theme-button-holder">
                            <button class="icon-button" onclick={() => {
                                props.page_viewer.current_page = props.docs_page;
                            }}>
                                <DocsIcon class="medium-icon"/>
                            </button>
                            <ThemeButton icon_class="medium-icon"/>
                        </div>
                        <SceneMinimap editor_space={props.editor.editor_space} nodes={props.editor.scene_controller.node_controller.nodes}/>
                    </div>
                    <div class="middle-tab container">
                        <EditorToolbar tool_controller={props.editor.tool_controller}/>
                    </div>
                </div>
            </Show>
        </div>
    )
}