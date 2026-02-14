import { NodeController } from "../nodes/node-controller";
import { EditorSpace } from "./editor-space";
import { createSignal, For, JSXElement } from "solid-js";
import { BaseNode } from "../nodes/base-node";
import { NodeView } from "../nodes/node-component";

export class NodeEditor {
    node_controller: NodeController
    editor_space: EditorSpace

    _selectedNode: () => BaseNode | null;
    _setSelectedNode: (node: BaseNode | null) => void;

    get selectedNode() { return this._selectedNode() }
    public updateSelectedNode(node: BaseNode | null) {
        this._setSelectedNode(node);
    }

    constructor () {
        const [selectedNode, setSelectedNode] = createSignal<BaseNode | null>(null);
        this._selectedNode = selectedNode
        this._setSelectedNode = setSelectedNode

        this.node_controller = new NodeController()
        this.editor_space = new EditorSpace()
    }

    public View() {
        let viewportRef: HTMLDivElement | undefined;
        const onPointerMove = (e: PointerEvent) => {
            const node = this.selectedNode;
            if (!node) return;

            node.updatePosition({
                x: node.x + e.movementX / this.editor_space.camera.zoom, 
                y: node.y + e.movementY / this.editor_space.camera.zoom
            });
        };

        const onPointerUp = () => this.updateSelectedNode(null);

        return (
            <div class="viewport" ref={viewportRef} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
                <For each={this.node_controller.nodes()}>
                    {(node) => {
                        return (<NodeView 
                            node={node}
                            camera={this.editor_space.camera}
                            onSelect={(node: BaseNode) => {this.updateSelectedNode(node)}}
                        />)
                    }}
                </For>
            </div>
        );
    }
}