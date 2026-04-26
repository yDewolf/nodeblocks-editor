import { createSignal } from 'solid-js';
import { Rect, Vector2 } from '../data_types/geometry';
import { NodeConnection } from './node-connection';
import { NodeSlot } from './slot/node-slot';
import { NodeData } from './data/node-data';
import { SuperSlotTypes } from './data/node-data-type';
import { BaseNode } from './scene-element';

export class GraphNode extends BaseNode {
    id: string;
    node_name: string;
    type_name: string;

    // Used to set node parameters etc.
    private _node_data: () => NodeData;
    private _set_node_data:  (data: NodeData) => void;

    private _last_output: () => Map<string, Map<string, any>>;
    private _set_last_output: (out: Map<string, Map<string, any>>) => void;

    private raw_pos: Vector2;
    private _slots: Map<SuperSlotTypes, NodeSlot[]> = new Map<SuperSlotTypes, NodeSlot[]>;

    private _pos: () => Vector2;
    private _setPos: (v: Vector2) => void;

    private _selected: () => boolean;
    private _setSelected: (v: boolean) => void;

    private _size: () => Vector2;
    private _setSize: (v: Vector2) => void;

    constructor(node_name: string, node_data: NodeData, position: Vector2, id: string = "", type_name: string = "BaseNode") {
        super();
        
        this.type_name = type_name;
        this.id = id;
        this.node_name = node_name;
        this.raw_pos = position;

        const [nodeData, setNodeData] = createSignal(node_data);
        this._node_data = nodeData;
        this._set_node_data = setNodeData;

        const [lastOutput, setLastOutput] = createSignal(new Map());
        this._last_output = lastOutput;
        this._set_last_output = setLastOutput;

        const [pos, setPos] = createSignal(position);
        this._pos = pos;
        this._setPos = setPos;

        const [selected, setSelected] = createSignal(false);
        this._selected = selected;
        this._setSelected = setSelected;

        const [size, setSize] = createSignal({ x: 100, y: 150 });
        this._size = size;
        this._setSize = setSize;

        // this._add_slot(new NodeSlot(this, INPUT_SLOT));
        // this._add_slot(new NodeSlot(this, OUTPUT_SLOT));
    }

    
    get last_output() { return this._last_output() }
    set last_output(output: Map<string, Map<string, any>>) { this._set_last_output(output) }

    get node_data() { return this._node_data(); }
    set node_data(data: NodeData) { this._set_node_data(data); }
    
    get pos() { return this._pos() }
    get x() { return this.pos.x }
    get y() { return this.pos.y }

    get width() { return this._size().x; }
    get height() { return this._size().y; }

    get slots() { return this._slots; }
    get all_slots() {
        let combined: NodeSlot[] = [];
        this._slots.values().forEach((slot_array) => {
            combined = combined.concat(slot_array);
        });

        return combined;
    }

    get rect() {
        return new Rect(this.pos, this._size());
    }

    get selected() { return this._selected() }
    set selected(value: boolean) { this._setSelected(value) }

    public get_slot(slot_name: string): NodeSlot | undefined {
        let target_slot: NodeSlot | undefined = undefined;
        this._slots.forEach((slots, slot_type) => {
            if (target_slot != undefined) {
                return;
            }
            const slot_found = slots.filter((slot) => slot.slot_name == slot_name);
            if (slot_found.length > 0) {
                target_slot = slot_found[0];
            }
        });

        return target_slot
    }

    public get_connections() {
        let combined: NodeConnection[] = [];
        this.slots.values().forEach(slots => {
            slots.forEach((slot) => {
                combined = combined.concat(slot.raw_connections)
            })
        });

        return combined;
    }

    public _add_slot(slot: NodeSlot) {
        let target_slots = this.slots.get(slot.type.super_type);
        if (target_slots == undefined) {
            target_slots = [];
        }

        this._slots.set(slot.type.super_type, [...target_slots, slot]);
    }

    // FIXME: Should these be on NodeComponent? 
    public updateSize(width: number, height: number) {
        if (width == 0 && height == 0) {
            return;
        }

        if (this.width !== width || this.height !== height) {
            this._setSize({ x: width, y: height });
        }
    }

    public move(delta: Vector2, grid_size: Vector2) {
        this.raw_pos.x += delta.x;
        this.raw_pos.y += delta.y;

        const newPosX = Math.round(this.raw_pos.x / grid_size.x) * grid_size.x;
        const newPosY = Math.round(this.raw_pos.y / grid_size.y) * grid_size.y;

        if (newPosX !== this.x || newPosY !== this.y) {
            this._setPos({x: newPosX, y: newPosY});
        }
    }

    public select() {

    }

    public get_relative_pos(camera_offset: Vector2) {
        return { x: (this.x - camera_offset.x), y: (this.y - camera_offset.y) };
    }

}
