import { EventData, EventHandler, InputEvents, THROTTLED_EVENTS } from "./event-handling";

export class EventManager {
    event_handlers: Map<InputEvents, Map<string, EventHandler>>;
    private pendingFrameEvents = new Map<InputEvents, EventData>();
    private requestAnimationFrameId: number | null = null;

    constructor() {
        this.event_handlers = new Map();
        Object.values(InputEvents).filter(value => typeof value === "number").forEach(key => {
            this.event_handlers.set(key, new Map());
        });
    }

    public cleanup() {
        this.pendingFrameEvents.clear();
    }

    public setEventHandler(targetEvent: InputEvents, handlerId: string, handler: EventHandler) {
        const handlers = this.event_handlers.get(targetEvent)
        if (handlers == null) {
            return;
        }
        handlers.set(handlerId, handler);
    }

    public generalizedEventHandler = (data: EventData, event_type: InputEvents) => {
        const e = data.event;
        const targetElement =
            data.targetElement ??
            (e?.currentTarget instanceof HTMLElement ? e.currentTarget : undefined);

        const isMouseOrPointer = e instanceof MouseEvent;
        const currentDelta = data.delta ?? {
            x: isMouseOrPointer ? e.movementX : 0,
            y: isMouseOrPointer ? e.movementY : 0,
        };

        if (!THROTTLED_EVENTS.has(event_type)) {
            this.dispatchToHandlers(
                {
                    ...data,
                    targetElement,
                    delta: currentDelta,
                },
                event_type
            );
            return;
        }

        const prev = this.pendingFrameEvents.get(event_type);
        const accumulatedDelta = {
            x: (prev?.delta?.x ?? 0) + currentDelta.x,
            y: (prev?.delta?.y ?? 0) + currentDelta.y,
        };

        this.pendingFrameEvents.set(event_type, {
            ...data,
            targetElement: targetElement ?? prev?.targetElement,
            delta: accumulatedDelta,
        });

        if (this.requestAnimationFrameId === null) {
            this.requestAnimationFrameId = requestAnimationFrame(() => {
                this.flushPendingFrameEvents();
            });
        }
    };

    private flushPendingFrameEvents(): void {
        this.requestAnimationFrameId = null;
        const batch = Array.from(this.pendingFrameEvents.entries());
        this.pendingFrameEvents.clear();

        for (const [eventType, latestData] of batch) {
            this.dispatchToHandlers(latestData, eventType);
        }
    }

    private dispatchToHandlers(data: EventData, event_type: InputEvents): void {
        const handlers = this.event_handlers.get(event_type);
        handlers?.forEach((handler) => {
            handler.func(data);
        });
    }
}