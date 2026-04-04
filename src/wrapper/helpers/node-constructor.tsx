import { Vector2 } from "~/wrapper/data_types/geometry";
import { SlotData } from "./node-type-file";
import { GraphNode } from "~/wrapper/nodes/graph-node";
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot";
import { NodeData } from "~/wrapper/nodes/data/node-data";
import { BaseSlotType, DataTypeUtils, UNKNOWN_TYPE } from "~/wrapper/nodes/data/node-data-type";


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
    }

    public make_node(node_name: string, position: Vector2, id: string = ""): GraphNode {
        const node = new GraphNode(
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

    public _make_slot(parent_node: GraphNode, slot_name: string, slot_data: SlotData) {
        const slot_type = this._slot_types.get(slot_data.type);
        if (!slot_type) {
            return null;
        }
        
        const slot_data_type = DataTypeUtils._match_node_data_type(slot_data.data_type == null ? "" : slot_data.data_type) 
        return new NodeSlot(
            parent_node, 
            slot_type, 
            slot_name,
            slot_data_type === UNKNOWN_TYPE ? null : slot_data_type
        )
    }

    public _make_all_slots(parent_node: GraphNode) {
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
    constructor(type_name: string, data: NodeData, slots: Map<string, SlotData>, slot_types: Map<string, BaseSlotType>) {
        super(type_name);
        
        this._data_model = data;
        this._slots = slots;
        this._slot_types = slot_types;
    }
}