import { createMemo, createSignal } from "solid-js";
import { BaseNode } from "./base-node";


export enum SlotTypes {
    INPUT,
    OUTPUT
}

export class NodeSlot {
    parent_node: BaseNode;

    type: SlotTypes
    _selected: () => boolean;
    _set_selected: (v: boolean) => boolean;

    connections: NodeSlot[] = [];

    constructor(parent: BaseNode, slot_type: SlotTypes) {
        const [selected, setSelected] = createSignal(false);
        this._selected = selected;
        this._set_selected = setSelected

        this.parent_node = parent;
        this.type = slot_type
    }

    get selected() { return this._selected() }
    set selected(value: boolean) { this._set_selected(value); console.log(value) }

    public connect(slot: NodeSlot): boolean {
        if (slot.type == this.type) {
            return false;
        }

        this.connections = [...this.connections, slot];
        // Check this later
        slot.connections = [...slot.connections, this];
        return true;
    }

    public View(onClickOnSlot: (slot: NodeSlot) => void) {
        const isConnected = createMemo(() => {
            return this.connections.length > 0;
        });

        return (
            <div 
                class="slot-container"
                
                onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    onClickOnSlot(this);
                }}
            >
                <div 
                    class="slot-dot"
                    classList={{
                        "connected-slot": isConnected(),
                        "selected-slot": this.selected,
                        "input-slot": this.type == SlotTypes.INPUT,
                        "output-slot": this.type == SlotTypes.OUTPUT,
                    }}
                >
                    {/* <div class="slot-label">bleh</div> */}
                </div>
            </div>
        )
    }
}   