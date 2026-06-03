import { EditorTool } from "~/editor/tools/base-tool";
import { SelectionTool } from "~/editor/tools/selection-tool";
import { ConnectionController } from "~/wrapper/controllers/connection-controller";
import { NodeEditor } from "../node-editor";
import { SelectionController } from "./selection-controller";
import { createSignal } from "solid-js";

export class ToolController {
    selection_controller: SelectionController
    connection_controller: ConnectionController;
    node_editor: NodeEditor

    private _current_tool: () => EditorTool | undefined
    private _set_current_tool: (tool: EditorTool | undefined) => void;
    private _tools: () => Array<EditorTool>;
    private _set_tools: (tools: Array<EditorTool>) => void;

    get current_tool() { return this._current_tool(); }
    get tools() { return this._tools(); }
    protected set tools(tools: Array<EditorTool>) {this._set_tools(tools);}

    constructor(node_editor: NodeEditor) {
        const [currentTool, setCurrentTool] = createSignal<EditorTool | undefined>(undefined);
        this._current_tool = currentTool;
        this._set_current_tool = setCurrentTool;

        this.selection_controller = node_editor.selection_controller;
        this.connection_controller = node_editor.scene_controller.connection_controller;
        this.node_editor = node_editor;
        const [tools, setTools] = createSignal([]);
        this._tools = tools;
        this._set_tools = setTools;
        this.add_default_tools();
    }

    protected add_default_tools() {
        this.tools.push(
            new SelectionTool(this.node_editor)
        );
        this.change_tool(this.tools[0]);
    }

    public change_tool = (tool: EditorTool) => {
        this._set_current_tool(tool);
    }
}