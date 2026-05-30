import { SlotComponent } from "~/editor/ui/node/slot-components";
import { GraphNode } from "~/wrapper/nodes/graph-node";
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot";

export enum InputEvents {
    POINTER_MOVING,
    CLICK_ON_NODE,
    CLICK_ON_NODE_SLOT,
    HOVER_NODE,
    HOVER_SLOT,
    HOVER_BACKGROUND
}

export interface EventData {
    event?: UIEvent
    node?: GraphNode,
    slot?: NodeSlot
}

export interface EventHandlerInterface {
    handler_func: (event_data: EventData) => void;
    name: string
}

export class EventHandler {
    name: string;
    private func: (event_data: EventData) => void;

    constructor(handler_name: string, handler_func: (event_data: EventData) => void) {
        this.name = handler_name;
        this.func = handler_func;
    }

    get handler() { return this.func; }
}