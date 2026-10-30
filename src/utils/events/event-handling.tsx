import { SceneNode } from "~/feature/scene/objects/scene-node";
import { SceneNodeSlot } from "~/feature/scene/objects/scene-slot";

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
    node?: SceneNode,
    slot?: SceneNodeSlot
}

export type EventHandlerFunc = (event_data: EventData) => void;
export class EventHandler {
    constructor(
        public readonly name: string,
        public func: EventHandlerFunc
    ) {

    }
}