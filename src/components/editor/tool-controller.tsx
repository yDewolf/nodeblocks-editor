import { SelectionController } from "./selection-controller";
import { EditorTool } from "./tools/base-tool";
import { SelectionTool } from "./tools/selection-tool";
import { NodeEditor } from "./node-editor";
import { ConnectionTool } from "./tools/connection-tool";



export class ToolController {
    selection_controller: SelectionController
    node_editor: NodeEditor

    current_tool: EditorTool | null = null

    constructor(node_editor: NodeEditor) {
        this.selection_controller = node_editor.selection_controller;
        this.node_editor = node_editor;
    }

    public change_tool(tool: EditorTool) {
        this.current_tool = tool;
    }

    public View() {
        const selection_tool = new SelectionTool(this.selection_controller, this.node_editor);
        const connection_tool = new ConnectionTool()

        this.change_tool(selection_tool);
        return (
            <div class="tool-selector">
                <ul>
                    <li>
                        <button onclick={() => {this.change_tool(selection_tool)}}>Select</button>
                    </li>
                    <li>
                        <button onclick={() => {this.change_tool(connection_tool)}}>Connect</button>
                    </li>
                </ul>
            </div>
        )
    }

}