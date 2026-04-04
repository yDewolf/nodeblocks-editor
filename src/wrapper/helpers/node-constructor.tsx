import { Vector2 } from "~/wrapper/data_types/geometry";
import { SlotData } from "./node-type-file";
import { BaseNode } from "~/wrapper/nodes/base-node";
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot";
import { BaseSlotType, CustomSlotType, INPUT_SLOT, OUTPUT_SLOT, SuperSlotTypes } from "~/wrapper/nodes/slot/slot-type";
import { CustomNodeDataType, NodeData } from "~/wrapper/nodes/data/node-data";
import { UNKNOWN_TYPE } from "~/wrapper/nodes/data/node-data-type";


export class BaseNodeConstructor {
    type_name: string;

    _data_model: NodeData
    _slots: Map<string, SlotData>;
    _slot_types: Map<string, BaseSlotType>;

    constructor(type_name: string) {
        this.type_name = type_name

        this._data_model = new NodeData(new Map());
        this._slots = new Map();
        this._slot_types = new Map();

        // Testing purposes
        // this._slot_types.set("input", INPUT_SLOT)
        // this._slot_types.set("output", OUTPUT_SLOT)

        // this._slots.set("in_0", {
        //     type: "input",
        //     data_type: "any",
        //     tooltip: ""
        // })

        // this._slots.set("out_0", {
        //     type: "output",
        //     data_type: "any",
        //     tooltip: ""
        // })
    }

    public make_node(node_name: string, position: Vector2, id: string = ""): BaseNode {
        const node = new BaseNode(
            node_name, new NodeData(this._data_model.raw_parameters), position, id, this.type_name
        );

        this._slots.forEach((slot_data, slot_name) => {
            const slot = this._make_slot(node, slot_name, slot_data);
            if (slot == null) {
                return;
            }
            node._add_slot(
                slot
            );
        });

        return node;
    }

    public _make_slot(parent_node: BaseNode, slot_name: string, slot_data: SlotData) {
        const slot_type = this._slot_types.get(slot_data.type);
        if (!slot_type) {
            return null;
        }
        
        const slot_data_type = CustomNodeDataType._match_data_type_str(slot_data.data_type == null ? "" : slot_data.data_type) 
        return new NodeSlot(
            parent_node, 
            slot_type, 
            slot_name,
            slot_data_type === UNKNOWN_TYPE ? null : slot_data_type
        )
    }

    public _make_all_slots(parent_node: BaseNode) {
        let slots: NodeSlot[] = []
        this._slots.forEach((slot_data, slot_name) => {
            const slot = this._make_slot(parent_node, slot_name, slot_data);
            if (slot == null) {
                return;
            }

            slots = [...slots, slot];
        });

        return slots;
    }
}

export class CustomNodeConstructor extends BaseNodeConstructor {
    constructor(type_name: string, data: NodeData, slots: Map<string, SlotData>, slot_types: Map<string, CustomSlotType>) {
        super(type_name);
        
        this._data_model = data;
        this._slots = slots;
        this._slot_types = slot_types;
    }
}