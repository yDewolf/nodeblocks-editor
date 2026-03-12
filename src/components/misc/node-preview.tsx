import { CustomNodeConstructor } from "~/helpers/node-constructor";
import { NodeAnchor } from "./node-anchors";
import { createSignal } from "solid-js";


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
        const ref_node = this.node_constructor.make_node(this.node_constructor.type_name, {x: 0, y: 0}, -1);
    
        return (
            <div 
                onPointerDown={() => onPointerDown(this)}
                class="node-type-preview"
                classList={{
                    "selected-node-type": this._selected()
                }}
                style={{
                    width: "fit-content",
                    "pointer-events": "none",
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
                        <div class="node-header">{ref_node.node_name}</div>
                        
                        <div class="node-content" style={{"pointer-events": "none"}}>
                            <div style={{display: "flex"}}>
                                <label>test</label>
                                <input type="text" />
                            </div>
                            <div class="node-internal-data"> ... </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
}
