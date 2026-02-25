import { createSignal } from "solid-js";
import { NodeSlot } from "~/components/nodes/node-slot";

export class ConnectionController {
    _selected_slot: () => NodeSlot | null;
    _set_selected_slot: (slot: NodeSlot | null) => void;

    constructor() {
        const [selectedSlot, setSelectedSlot] = createSignal(null);
        this._selected_slot = selectedSlot;
        this._set_selected_slot = setSelectedSlot;
    }

    get selected_slot() { return this._selected_slot() }
    set selected_slot(slot: NodeSlot | null) { this._set_selected_slot(slot) }

    public select_slot(slot: NodeSlot) {
        this.unselect_slot();

        this.selected_slot = slot;
        this.selected_slot.selected = true;
    }

    public unselect_slot() {
        if (this.selected_slot != null) {
            this.selected_slot.selected = false;
        } 
    }

    
}