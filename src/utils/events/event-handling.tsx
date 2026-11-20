import { SceneNode } from "~/feature/scene/objects/scene-node";
import { SceneNodeSlot } from "~/feature/scene/objects/scene-slot";
import { Vector2 } from "~/protocols/nodeblocks/geometry";

export enum InputEvents {
    POINTER_MOVING,
    CLICK_ON_NODE,
    CLICK_ON_NODE_SLOT,
    HOVER_NODE,
    HOVER_SLOT,
    HOVER_BACKGROUND
}

export const THROTTLED_EVENTS = new Set<InputEvents>([
    InputEvents.POINTER_MOVING,
    InputEvents.HOVER_NODE,
    InputEvents.HOVER_SLOT,
    InputEvents.HOVER_BACKGROUND,
]);

export interface EventData {
    event?: UIEvent
    node?: SceneNode
    slot?: SceneNodeSlot

    targetElement?: HTMLElement;
    delta?: Vector2;
}

export type EventHandlerFunc = (event_data: EventData) => void;
export class EventHandler {
    constructor(
        public readonly name: string,
        public func: EventHandlerFunc
    ) {

    }
}