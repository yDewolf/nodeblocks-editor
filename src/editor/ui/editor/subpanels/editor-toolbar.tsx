import { Component, For, JSXElement } from "solid-js";
import { ToolController } from "~/editor/controllers/tool-controller";
import { EditorTool } from "~/editor/tools/base-tool";
import { SelectionTool } from "~/editor/tools/selection-tool";
import CursorIcon from "~/assets/icons/cursor.svg";
import CommentIcon from "~/assets/icons/comment.svg";
import AskDocsIcon from "~/assets/icons/ask-about.svg";
import { DocsTool } from "~/editor/tools/docs-tool";
import { CommentTool } from "~/editor/tools/comment-tool";

interface EditorToolStyle {
    icon: Component,
}
const TOOL_ICON_MAP = new Map<string, EditorToolStyle>([
    [SelectionTool.name, {icon: CursorIcon}],
    [DocsTool.name, {icon: AskDocsIcon}],
    [CommentTool.name, {icon: CommentIcon}]
]);

const ToolSelector = (props: {tool: EditorTool, current_tool?: EditorTool, set_selected_tool: (tool: EditorTool) => void, icon?: JSXElement}) => {
    const tool_name = props.tool.constructor.name;
    const tool_style = TOOL_ICON_MAP.get(tool_name);
    return (
        <button onclick={() => {props.set_selected_tool(props.tool);}}
            class="tool-selector-container" 
            classList={{
                "selected": props.current_tool === props.tool
            }}
        >
            {tool_style?.icon({class: "small-icon"})}
        </button>
    )
}

export const EditorToolbar = (props: {tool_controller: ToolController}) => {
    return (
        <div class="toolbar-holder" data-theme="dark">
            <div class="toolbar-content">
                <div class="toolbar-tools">
                    <For each={props.tool_controller.tools}>
                        {(tool: EditorTool) => {
                            return (
                                <ToolSelector tool={tool} current_tool={props.tool_controller.current_tool} set_selected_tool={props.tool_controller.change_tool}/>
                            )
                        }}
                    </For>
                </div>
                <div class="toolbar-scene-states">
                    TODO
                </div>
            </div>
        </div>
    )
}