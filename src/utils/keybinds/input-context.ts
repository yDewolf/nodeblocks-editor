import { KeybindTrigger } from "./keybind-trigger";

export type KeybindCallback = (event: Event) => void;

export interface KeybindHandlers {
    just_activated?: KeybindCallback;
    while_active?: KeybindCallback;
    just_released?: KeybindCallback;
}

export interface KeybindBinding {
    trigger: KeybindTrigger;
    handlers: KeybindHandlers;
}

export class InputContext {
    private bindings: Map<string, KeybindBinding> = new Map();

    constructor(
        public readonly name: string,
        public readonly parent?: InputContext
    ) {}

    public bind(name: string, trigger: KeybindTrigger, handlers: KeybindHandlers): this {
        this.bindings.set(name, { trigger, handlers });
        return this;
    }

    public unbind(name: string): void {
        this.bindings.delete(name);
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

        return merged;
    }
}