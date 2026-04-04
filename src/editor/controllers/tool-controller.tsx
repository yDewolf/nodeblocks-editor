import { EditorTool } from "~/editor/tools/base-tool";
import { SelectionTool } from "~/editor/tools/selection-tool";
import { ConnectionController } from "~/wrapper/controllers/connection-controller";
import { NodeEditor } from "../node-editor";
import { SelectionController } from "./selection-controller";

export class ToolController {
    selection_controller: SelectionController
    connection_controller: ConnectionController;
    node_editor: NodeEditor

    current_tool: EditorTool | null = null

    constructor(node_editor: NodeEditor) {
        this.selection_controller = node_editor.selection_controller;
        this.connection_controller = node_editor.scene_controller.connection_controller;
        this.node_editor = node_editor;
    }

    public change_tool(tool: EditorTool) {
        this.current_tool = tool;
    }

    public View() {
        const selection_tool = new SelectionTool(this.node_editor);

        this.change_tool(selection_tool);
        return (
            <div class="tool-selector">
                <ul>
                    <li>
                        <button onclick={() => {this.change_tool(selection_tool)}}>Select</button>
                    </li>
                </ul>
            </div>
        )
    }

}