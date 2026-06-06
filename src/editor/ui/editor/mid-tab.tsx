import { EditorSpace } from "~/editor/internal/editor-space"
import { SceneController } from '../../../wrapper/controllers/scene-controller';
import { ToolController } from '../../controllers/tool-controller';
import { ThemeButton } from "../components/buttons/theme-button";
import { SceneMinimap } from "../components/scene-minimap";
import { EditorToolbar } from "./subpanels/editor-toolbar";

export const EditorMidTab = (props: {tool_controller: ToolController, scene_controller: SceneController, editor_space: EditorSpace}) => {
    return (
        <div class="middle-tab-holder">
            <div class="middle-tab-overlay container">
                <div class="keep fill row-container space-between">
                    {/* <div>
                        TODO: Docs Button here
                    </div> */}
                    {/* Placeholder: */}
                    <div class="theme-button-holder">
                        <ThemeButton icon_class="medium-icon"/>
                    </div>
                    <SceneMinimap editor_space={props.editor_space} nodes={props.scene_controller.node_controller.nodes}/>
                </div>
            </div>
            <div class="middle-tab container">
                <EditorToolbar tool_controller={props.tool_controller}/>
            </div>
        </div>
    )
}