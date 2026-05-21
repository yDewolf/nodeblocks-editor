import { Vector2 } from "~/wrapper/data_types/geometry";
import { SlotData } from "./node-type-file";
import { GraphNode } from "~/wrapper/nodes/graph-node";
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot";
import { NodeData } from "~/wrapper/nodes/data/node-data";
import { NodeMetadata, UNSET_CATEGORY } from "../nodes/data/node-metadata";
import { DataTypeUtils, UNKNOWN_TYPE } from "../nodes/data/node-data-type";
import { BaseSlotType } from "../nodes/data/slot-types";


export class BaseNodeConstructor {
    type_name: string;

    _metadata: NodeMetadata
    _data_model: NodeData
    
    _slots: Map<string, SlotData>;
    _slot_types: Map<string, BaseSlotType>;

    constructor(type_name: string) {
        this.type_name = type_name
        
        this._metadata = {
            category: UNSET_CATEGORY,
            capitalized_type: this.type_name,
            tags: []
        };
        this._data_model = new NodeData(new Map());
        this._slots = new Map();
        this._slot_types = new Map();
    }

    public make_node(node_name: string, position: Vector2, id: string = "", node_data: Map<string, any> | undefined = undefined): GraphNode {
        const node = new GraphNode(
            node_name, this._metadata, new NodeData(this._data_model.raw_parameters), position, id, this.type_name
        );
        if (node_data) {
            node_data.entries().forEach(([key, value]) => {
                const param = node.node_data.parameters.get(key);
                if (param) {
                    param.value = value;
                }
            });
        }

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
        
        const slot_data_type = DataTypeUtils._match_default_data_type(slot_data.data_type == null ? "" : slot_data.data_type) 
        return new NodeSlot(
            parent_node, 
            slot_type, 
            slot_name,
            slot_data.is_input,
            slot_data_type === UNKNOWN_TYPE ? null : slot_data_type,
            slot_data.max_connections
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
    constructor(type_name: string, metadata: NodeMetadata, data: NodeData, slots: Map<string, SlotData>, slot_types: Map<string, BaseSlotType>) {
        super(type_name);
        
        this._metadata = metadata;
        this._data_model = data;
        this._slots = slots;
        this._slot_types = slot_types;
    }
}