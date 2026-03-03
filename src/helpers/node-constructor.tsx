import { Vector2 } from "~/data_types/geometry";
import { SlotData } from "./node-type-file";
import { BaseNode } from "~/components/nodes/base-node";
import { NodeSlot } from "~/components/nodes/slot/node-slot";
import { BaseSlotType, CustomSlotType, INPUT_SLOT, OUTPUT_SLOT, SuperSlotTypes } from "~/components/nodes/slot/slot-type";
import { CustomNodeDataType, NodeData } from "~/components/nodes/data/node-data";
import { UNKNOWN_TYPE } from "~/components/nodes/data/node-data-type";


export class BaseNodeConstructor {
    type_name: string;

    _data: NodeData
    _slots: Map<string, SlotData>;
    _slot_types: Map<string, BaseSlotType>;

    constructor(type_name: string) {
        this.type_name = type_name

        this._data = new NodeData(new Map());
        this._slots = new Map();
        this._slot_types = new Map();

        // Testing purposes
        this._slot_types.set("input", INPUT_SLOT)
        this._slot_types.set("output", OUTPUT_SLOT)

        this._slots.set("in_0", {
            type: "input",
            data_type: "any",
            tooltip: ""
        })

        this._slots.set("out_0", {
            type: "output",
            data_type: "any",
            tooltip: ""
        })
    }

    public make_node(node_name: string, position: Vector2, id: number = -1): BaseNode {
        const node = new BaseNode(
            node_name, this._data, position, id
        );

        this._slots.forEach((slot_data, slot_name) => {
            const slot_type = this._slot_types.get(slot_data.type);
            if (!slot_type) {
                return;
            }
            const slot_data_type = CustomNodeDataType._match_data_type_str(slot_data.data_type == null ? "" : slot_data.data_type) 
            node._add_slot(
                new NodeSlot(
                    node, 
                    slot_type, 
                    slot_name,
                    slot_data_type === UNKNOWN_TYPE ? null : slot_data_type
                )
            );
        });

        return node;
    }
}

export class CustomNodeConstructor extends BaseNodeConstructor {
    constructor(type_name: string, data: NodeData, slots: Map<string, SlotData>, slot_types: Map<string, CustomSlotType>) {
        super(type_name);
        
        this._data = data;
        this._slots = slots;
        this._slot_types = slot_types;
    }
}