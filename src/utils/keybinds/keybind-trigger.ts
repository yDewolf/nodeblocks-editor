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

    public matches(event: Event): boolean {
        if (this.config.isWheel && event instanceof WheelEvent && event.deltaY != 0.0) {
            return true;
        }

        if (this.config.keys && event instanceof KeyboardEvent) {
            return true;
        }

        if (this.config.mouseButtons && event instanceof PointerEvent) {
            return true;
        }

        return false;
    }

    public isSatisfied(
        pressedKeys: Set<string>, 
        pressedMouseButtons: Set<number>, 
        event: Event
    ): boolean {
        const expectedModifiers: KeyModifiers = {
            ctrl: this.config.modifiers?.ctrl ?? false,
            shift: this.config.modifiers?.shift ?? false,
            alt: this.config.modifiers?.alt ?? false,
            meta: this.config.modifiers?.meta ?? false,
        };

        if (event instanceof KeyboardEvent || event instanceof MouseEvent || event instanceof WheelEvent) {
            if (event.ctrlKey !== expectedModifiers.ctrl) return false;
            if (event.shiftKey !== expectedModifiers.shift) return false;
            if (event.altKey !== expectedModifiers.alt) return false;
            if (event.metaKey !== expectedModifiers.meta) return false;
        }

        if (this.config.keys) {
            const hasAllKeys = this.config.keys.every(code => pressedKeys.has(code));
            if (!hasAllKeys) return false;
        }

        if (this.config.mouseButtons) {
            const hasAnyButton = this.config.mouseButtons.some(btn => pressedMouseButtons.has(btn));
            if (!hasAnyButton) return false;
        }

        if (this.config.isWheel) {
            if (!(event instanceof WheelEvent) || event.deltaY === 0) return false;
        }

        return true;
    }

    public getSpecificityScore(): number {
        let score = 0;
        if (this.config.keys) score += this.config.keys.length;
        if (this.config.mouseButtons) score += this.config.mouseButtons.length;
        if (this.config.isWheel) score += 1;
        
        if (this.config.modifiers) {
            if (this.config.modifiers.ctrl) score += 2;
            if (this.config.modifiers.shift) score += 2;
            if (this.config.modifiers.alt) score += 2;
            if (this.config.modifiers.meta) score += 2;
        }
        return score;
    }
}
