import { EventData, EventHandler, InputEvents } from "./event-handling";

export class EventManager {
    event_handlers: Map<InputEvents, Map<string, EventHandler>>;

    constructor() {
        this.event_handlers = new Map();
        Object.values(InputEvents).filter(value => typeof value === "number").forEach(key => {
            this.event_handlers.set(key, new Map());
        });
    }

    public setEventHandler(targetEvent: InputEvents, handlerId: string, handler: EventHandler) {
        const handlers = this.event_handlers.get(targetEvent)
        if (handlers == null) {
            return;
        }
        handlers.set(handlerId, handler);
    }

    public generalizedEventHandler = (data: EventData, event_type: InputEvents) => {
        const handlers = this.event_handlers.get(event_type)
        handlers?.forEach(handler => {
            handler.func(data);
        });
    }
}