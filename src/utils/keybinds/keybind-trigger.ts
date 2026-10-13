export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2
}

export interface KeyModifiers {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
}

export interface TriggerConfig {
    keys?: string[];
    mouseButtons?: MouseButton[];
    modifiers?: KeyModifiers;
    isWheel?: boolean;
}

export class KeybindTrigger {
    constructor(public readonly config: TriggerConfig) {}

    public matches(event: KeyboardEvent | MouseEvent | WheelEvent | PointerEvent): boolean {
        const expectedModifiers: KeyModifiers = {
            ctrl: this.config.modifiers?.ctrl ?? false,
            shift: this.config.modifiers?.shift ?? false,
            alt: this.config.modifiers?.alt ?? false,
            meta: this.config.modifiers?.meta ?? false,
        };

        if (event.ctrlKey !== expectedModifiers.ctrl) return false;
        if (event.shiftKey !== expectedModifiers.shift) return false;
        if (event.altKey !== expectedModifiers.alt) return false;
        if (event.metaKey !== expectedModifiers.meta) return false;

        if (this.config.keys && event instanceof KeyboardEvent) {
            if (!this.config.keys.includes(event.code)) return false;
        }

        if (this.config.mouseButtons && (event instanceof MouseEvent || event instanceof PointerEvent)) {
            if (!this.config.mouseButtons.includes(event.button)) return false;
        }

        if (this.config.isWheel && event instanceof WheelEvent) {
            return true;
        }

        return true;
    }
}
