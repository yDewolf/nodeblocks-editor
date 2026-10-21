import { Component, For, JSXElement } from "solid-js";
import CursorIcon from "~/assets/icons/cursor.svg";
import { EditorTool } from "~/feature/editor/tools/base-tool";
import { DocsTool } from "~/feature/editor/tools/docs-tool";
import { SelectionTool } from "~/feature/editor/tools/selection-tool";
// import CommentIcon from "~/assets/icons/comment.svg";
import AskDocsIcon from "~/assets/icons/ask-about.svg";
import { useEditor } from "~/feature/scene-editor-context";
import { getCurrentTheme } from "~/feature/ui-themes";

interface EditorToolStyle {
    icon: Component,
}
const TOOL_ICON_MAP = new Map<string, EditorToolStyle>([
    [SelectionTool.name, {icon: CursorIcon}],
    [DocsTool.name, {icon: AskDocsIcon}],
    // [CommentTool.name, {icon: CommentIcon}]
]);

const ToolSelector = (props: {tool: EditorTool, current_tool?: EditorTool, set_selected_tool: (tool: EditorTool) => void, icon?: JSXElement}) => {
    const tool_name = props.tool.constructor.name;
    const tool_style = TOOL_ICON_MAP.get(tool_name);
    return (
        <button onclick={() => {
            props.set_selected_tool(props.tool);
        }}
            class="tool-selector-container" 
            classList={{
                "selected": props.current_tool === props.tool
            }}
        >
            {tool_style?.icon({class: "small-icon"})}
        </button>
    )
}

export const EditorToolbar = () => {
    const toolController = useEditor().toolController
    return (
        <div class="toolbar-holder" data-theme={getCurrentTheme() == "light" ? "dark" : getCurrentTheme()}>
            <div class="toolbar-content">
                <div class="toolbar-tools">
                    <For each={toolController.tools}>
                        {(tool: EditorTool) => {
                            return (
                                <ToolSelector tool={tool} current_tool={toolController.current_tool} set_selected_tool={toolController.set_tool}/>
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