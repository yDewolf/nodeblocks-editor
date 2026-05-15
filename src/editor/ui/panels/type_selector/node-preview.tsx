import { CustomNodeConstructor } from "~/wrapper/helpers/node-constructor";
import { NodeAnchor } from "../../misc/node-anchors";
import { createSignal, For } from "solid-js";
import { NodeParameter } from "~/wrapper/nodes/data/node-data";
import { NodeField } from "~/editor/ui/node/node-field";


export class NodePreview {
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

    public View(onPointerDown: (node_preview: NodePreview) => void) {
        const onClickOnSlot = () => {};
        const onHoverSlot = () => {};
        const ref_node = this.node_constructor.make_node(this.node_constructor.type_name, {x: 0, y: 0}, "");
    
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
                <div class="node-slots">
                    <NodeAnchor anchor_pos={{x: 0, y: -1}} all_slots={ref_node.all_slots} onClickOnSlot={onClickOnSlot} onHoverSlot={onHoverSlot}/>
                    <div class="side-anchors">
                        <NodeAnchor anchor_pos={{x: -1, y: 0}} all_slots={ref_node.all_slots} onClickOnSlot={onClickOnSlot} onHoverSlot={onHoverSlot}/>
                        <div></div>
                        <NodeAnchor anchor_pos={{x: 1, y: 0}} all_slots={ref_node.all_slots} onClickOnSlot={onClickOnSlot} onHoverSlot={onHoverSlot}/>
                    </div>
                    <NodeAnchor anchor_pos={{x: 0, y: 1}} all_slots={ref_node.all_slots} onClickOnSlot={onClickOnSlot} onHoverSlot={onHoverSlot}/>
                </div>
                    <div
                    class="internal-node"
                >
                    <div class="node-body">
                        <div class="node-header">{ref_node.metadata.capitalized_type}</div>
                        
                        <div class="node-content remove-input">
                            <For each={this.node_constructor._data_model.parameters.values().toArray()}>
                                {(parameter: NodeParameter) => <NodeField 
                                    node={null}
                                    parameter={parameter}
                                    parameter_sync={undefined}
                                    workspace={undefined}
                                />
                                }
                            </For>
                            <div class="node-internal-data"> ... </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
}
