import { createSignal } from 'solid-js';
import { Rect, Vector2 } from '../data_types/geometry';
import { NodeConnection } from './node-connection';
import { NodeSlot, SlotOutputWrapper } from './slot/node-slot';
import { NodeData } from './data/node-data';
import { BaseNode } from './scene-element';

export type NodeOutput = Record<string, SlotOutputWrapper>;

export class GraphNode extends BaseNode {
    id: string;
    node_name: string;

    root_id: string;
    type_id: string;

    // Used to set node parameters etc.
    private _node_data: () => NodeData;
    private _set_node_data:  (data: NodeData) => void;

    private _last_output: () => Map<string, SlotOutputWrapper>;
    private _set_last_output: (out: Map<string, SlotOutputWrapper>) => void;

    private _target_slot_output: () => string | undefined;
    private _set_target_slot_output: (slot_id: string | undefined) => void;

    private _is_current_step: () => boolean;
    private _set_current_step: (v: boolean) => void;

    private raw_pos: Vector2;
    private _slots: NodeSlot[] = [];

    private _pos: () => Vector2;
    private _setPos: (v: Vector2) => void;

    private _selected: () => boolean;
    private _setSelected: (v: boolean) => void;

    private _size: () => Vector2;
    private _setSize: (v: Vector2) => void;

    constructor(type_id: string, root_type: string, node_name: string, node_data: NodeData, position: Vector2, id: string = "") {
        super();
        
        this.root_id = root_type;
        this.type_id = type_id;
        this.id = id;
        this.node_name = node_name;
        this.raw_pos = position;

        const [nodeData, setNodeData] = createSignal(node_data);
        this._node_data = nodeData;
        this._set_node_data = setNodeData;

        const [lastOutput, setLastOutput] = createSignal(new Map());
        this._last_output = lastOutput;
        this._set_last_output = setLastOutput;

        const [targetSlotOutput, setTargetSlotOutput] = createSignal(undefined);
        this._target_slot_output = targetSlotOutput;
        this._set_target_slot_output = setTargetSlotOutput;

        const [currentStep, setCurrentStep] = createSignal(false);
        this._is_current_step = currentStep;
        this._set_current_step = setCurrentStep

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

    get is_current_step() { return this._is_current_step() }
    set is_current_step(v: boolean) { this._set_current_step(v) }

    get target_slot_output() { return this._target_slot_output() }
    set target_slot_output(slot_id: string | undefined) { this._set_target_slot_output(slot_id); }

    get last_output() { return this._last_output() }
    set last_output(output: Map<string, SlotOutputWrapper>) { 
        this._set_last_output(output) 
        if (this.target_slot_output == undefined) {
            const output_slots = this.output_slots;
            if (output_slots.length == 0) return;
            this.target_slot_output = output_slots[0].slot_id;
        }
    }

    get node_data() { return this._node_data(); }
    set node_data(data: NodeData) { this._set_node_data(data); }
    
    get pos() { return this._pos() }
    get x() { return this.pos.x }
    get y() { return this.pos.y }

    get width() { return this._size().x; }
    get height() { return this._size().y; }

    get input_slots() {
        return this._slots.filter((slot) => slot.is_input == true);
    }
    get output_slots() {
        return this._slots.filter((slot) => slot.is_input == false);
    }
    get all_slots() { return this._slots; }

    get rect() {
        return new Rect(this.pos, this._size());
    }

    get selected() { return this._selected() }
    set selected(value: boolean) { this._setSelected(value) }

    public get_slot(slot_id: string): NodeSlot | undefined {
        let target_slot: NodeSlot | undefined = undefined;
        const found_slots = this._slots.filter((slot) => slot.slot_id == slot_id);
        if (found_slots) {
            target_slot = found_slots[0];
        }

        return target_slot
    }

    public get_connections() {
        let combined: NodeConnection[] = [];
        this._slots.forEach((slot) => {
            combined = combined.concat(slot.raw_connections)
        })

        return combined;
    }

    public _add_slot(slot: NodeSlot) {
        // this._slots = [...this._slots, slot];
        this._slots.push(slot);
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
