import { CustomNodeConstructor } from "~/wrapper/helpers/node-constructor";
import { NodeAnchor } from "../../misc/node-anchors";
import { createSignal, For } from "solid-js";
import { NodeParameter } from "~/wrapper/nodes/data/node-data";
import { NodeField } from "~/editor/ui/node/node-field";
import { metadata } from "~/singletons/metadata";
import { NodeComponentV2, NodePreview } from '../../node/node-component';


export class NodeTypePreview {
    node_constructor: CustomNodeConstructor
    private _set_selected: (v: boolean) => void;
    private _selected: () => boolean;

    constructor(node_constructor: CustomNodeConstructor) {
        this.node_constructor = node_constructor;
        
        const [selected, setSelected] = createSignal(false);
        this._set_selected = setSelected;
        this._selected = selected;
    }

    set selected(value: boolean) { this._set_selected(value) }

    public View(onPointerDown: (node_preview: NodeTypePreview) => void) {
        return (
            <div 
                onPointerDown={() => onPointerDown(this)}
                class="node node-type-preview remove-input"
                classList={{
                    "selected-node-type": this._selected()
                }}
                style={{
                    cursor: "pointer"
                }}
            >
                <NodePreview constructor={this.node_constructor}/>
            </div>
        );
    };
}
