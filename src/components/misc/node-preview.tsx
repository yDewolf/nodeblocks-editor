import { CustomNodeConstructor } from "~/helpers/node-constructor";
import { NodeAnchor } from "./node-anchors";


export class NodePreview {
    node_constructor: CustomNodeConstructor

    constructor(node_constructor: CustomNodeConstructor) {
        this.node_constructor = node_constructor;
    }

    public View() {
        const onClickOnSlot = () => {};
        const onHoverSlot = () => {};
        const ref_node = this.node_constructor.make_node("Dummy", {x: 0, y: 0}, -1);
    
        return (
            <div 
                style={{
                    position: "absolute",
                    transform: "scale(0.75)"
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
                        
                        <div class="node-content">
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
