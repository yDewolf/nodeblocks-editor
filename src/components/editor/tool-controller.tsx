import { Grid } from "../misc/grid";
import { EditorSpace } from "./editor-space";
import { SelectionController } from "./selection-controller";

export class ToolController {
    selection_controller: SelectionController
    
    constructor(editor_space: EditorSpace, editor_grid: Grid) {
        this.selection_controller = new SelectionController(editor_space, editor_grid);
    }

    public change_tool(tool_id: number) {
        console.log("selected tool", tool_id)
    }

    public View() {
        return (
            <div class="tool-selector">
                <ul>
                    <li>
                        <button onclick={() => {this.change_tool(0)}}>Select</button>
                    </li>
                    <li>
                        <button onclick={() => {this.change_tool(1)}}>Connect</button>
                    </li>
                </ul>
            </div>
        )
    }
}