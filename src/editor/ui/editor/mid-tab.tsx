import { ThemeButton } from "../components/buttons/theme-button";
import { SceneMinimap } from "../components/scene-minimap";
import { EditorToolbar } from "./subpanels/editor-toolbar";
import { NodeEditor } from "~/editor/node-editor";
import { PageViewer, StaticViewDisplayer } from '../components/page-controller';
import { Show } from "solid-js";

export const EditorMidTab = (props: {page_viewer: PageViewer, editor: NodeEditor}) => {
    return (
        <div class="middle-tab-holder">
            <Show when={!props.page_viewer.current_page} fallback={
                <StaticViewDisplayer current_page={props.page_viewer.current_page}/>
            }>
                <div class="middle-tab-overlay container">
                    <div class="keep fill row-container space-between">
                        {/* <div>
                            TODO: Docs Button here
                        </div> */}
                        {/* Placeholder: */}
                        <div class="theme-button-holder">
                            <ThemeButton icon_class="medium-icon"/>
                        </div>
                        <SceneMinimap editor_space={props.editor.editor_space} nodes={props.editor.scene_controller.node_controller.nodes}/>
                    </div>
                </div>
                <div class="middle-tab container">
                    <EditorToolbar tool_controller={props.editor.tool_controller}/>
                </div>
            </Show>
        </div>
    )
}