import { createSignal } from "solid-js";
import { SelectionController } from "../canvas/selection-controller";
import { EditorTool } from "../tools/base-tool";
import { InputContext } from '../../../utils/keybinds/input-context';

export class ToolController {
    private _current_tool: () => EditorTool | undefined
    private _set_current_tool: (tool: EditorTool | undefined) => void;
    private _tools: () => Array<EditorTool>;
    private _set_tools: (tools: Array<EditorTool>) => void;

    get current_tool() { return this._current_tool(); }
    private set current_tool(tool: EditorTool | undefined) {
        if (this.current_tool) {
            this.current_tool.cleanupKeybinds(this.inputContext);
        }

        this._set_current_tool(tool);
        
        if (tool) {
            tool.setupKeybinds(this.inputContext);
        }
    }

    get tools() { return this._tools(); }
    protected set tools(tools: Array<EditorTool>) {this._set_tools(tools);}

    constructor(
        private readonly inputContext: InputContext,
        
    ) {
        [this._current_tool, this._set_current_tool] = createSignal<EditorTool | undefined>(undefined);
        [this._tools, this._set_tools] = createSignal([]);
    }

    public add_tool(tool: EditorTool) {
        this.tools.push(tool);
    }

    public change_tool(tool_idx: number) {
        this.current_tool = this.tools.at(tool_idx);
    }

    public set_tool = (tool: EditorTool) => {
        this.current_tool = tool;
    }
}