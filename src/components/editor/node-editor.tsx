import { NodeController } from "../nodes/node-controller";
import { EditorSpace } from "./editor-space";
import { createSignal, For, JSXElement } from "solid-js";
import { BaseNode } from "../nodes/base-node";
import { NodeView } from "../nodes/node-component";

export class NodeEditor {
    node_controller: NodeController
    editor_space: EditorSpace

    constructor () {
        this.node_controller = new NodeController()
        this.editor_space = new EditorSpace()
    }

    public View() {
        return (
            <div class="viewport">
                <For each={this.node_controller.nodes()}>
                    {(node) => {
                        console.log("Renderizando node:", node.node_name, "x:", node.x);

                        return (<NodeView 
                            node={node} 
                            cameraOffset={this.editor_space.camera.offset} 
                            screenSize={{x: 1920, y: 1080}} 
                        />)
                    }}
                </For>
            </div>
        );
    }
}