import { KeybindTrigger } from "./keybind-trigger";

export type KeybindCallback = (event: Event) => void;

export interface KeybindHandlers {
    just_activated?: KeybindCallback;
    while_active?: KeybindCallback;
    just_released?: KeybindCallback;
}

export interface KeybindBinding {
    triggers: KeybindTrigger[];
    handlers: KeybindHandlers;
    maxSpecificity: number;
}

export class InputContext {
    private bindings: Map<string, KeybindBinding> = new Map();

    constructor(
        public readonly name: string,
        public readonly parent?: InputContext,
        private _contextMenuHandler?: (e: MouseEvent) => void
    ) {}

    get contextHandler() { return this._contextMenuHandler; }

    public setContextHandler(handler: (e: MouseEvent) => void) {
        this._contextMenuHandler = handler;
    } 

    public setHandlers(keybind_name: string, handlers: KeybindHandlers) {
        const keybind = this.bindings.get(keybind_name);
        if (!keybind) {
            console.warn("Couldn't find keybind: ", keybind_name, " in context: ", this.name);
            return;
        }
        keybind.handlers = handlers;
    }

    public bind(name: string, triggers: KeybindTrigger | KeybindTrigger[], handlers: KeybindHandlers): this {
        const triggerArray = Array.isArray(triggers) ? triggers : [triggers];
        const maxSpecificity = triggerArray.reduce(
            (max, triger) => Math.max(max, triger.getSpecificityScore()), 
            0
        );

        this.bindings.set(name, { triggers: triggerArray, handlers, maxSpecificity });
        return this;
    }

    public unbind(name: string): void {
        this.bindings.delete(name);
    }

    public getKeybind(name: string) {
        return this.getAllBindings().get(name);
    }

    public getFirstKeybindTrigger(name: string) {
        return this.getKeybind(name)?.triggers.at(0)
    }

    public getAllBindings(): Map<string, KeybindBinding> {
        const merged = new Map<string, KeybindBinding>();
        if (this.parent) {
            for (const [name, binding] of this.parent.getAllBindings()) {
                merged.set(name, binding);
            }
        }
        
        for (const [name, binding] of this.bindings) {
            merged.set(name, binding);
        }
        const sortedEntries = new Map(Array.from(merged.entries()).sort(([, a], [, b]) => {
            return b.maxSpecificity - a.maxSpecificity;
        }));
        return sortedEntries;
    }
}