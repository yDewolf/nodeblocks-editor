import { InputContext, KeybindBinding } from "./input-context";

export class InputManager {
    private activeContext: InputContext | null = null;
    private pressedKeybinds: Set<string> = new Set();

    public setActiveContext(context: InputContext | null): void {
        this.activeContext = context;
    }

    public getActiveContext(): InputContext | null {
        return this.activeContext;
    }

    private getActiveBindings(): Map<string, KeybindBinding> {
        if (!this.activeContext) return new Map();
        return this.activeContext.getAllBindings();
    }

    // Events

    public onPointerDown(event: PointerEvent): void {
        this.evaluatePress(event);
    }

    public onPointerUp(event: PointerEvent): void {
        this.evaluateRelease(event);
    }

    public onWheel(event: WheelEvent): void {
        this.evaluatePress(event);
    }

    public onMouseMove(event: PointerEvent): void {
        const bindings = this.getActiveBindings();
        for (const name of this.pressedKeybinds) {
            const binding = bindings.get(name);
            if (binding?.handlers.while_active) {
                binding.handlers.while_active(event);
            }
        }
    }

    public onKeyDown(event: KeyboardEvent): void {
        this.evaluatePress(event);
    }

    public onKeyUp(event: KeyboardEvent): void {
        this.evaluateRelease(event);
    }



    // Evaluators

    private evaluatePress(event: KeyboardEvent | MouseEvent | WheelEvent | PointerEvent): void {
        const bindings = this.getActiveBindings();

        for (const [name, binding] of bindings.entries()) {
            if (binding.trigger.matches(event)) {
                const handlers = binding.handlers;

                if (!this.pressedKeybinds.has(name)) {
                    this.pressedKeybinds.add(name);
                    handlers.just_activated?.(event);
                } else {
                    handlers.while_active?.(event);
                }
            }
        }
    }

    private evaluateRelease(event: KeyboardEvent | MouseEvent | WheelEvent | PointerEvent): void {
        const bindings = this.getActiveBindings();

        for (const name of this.pressedKeybinds) {
            const binding = bindings.get(name);
            if (binding && !binding.trigger.matches(event)) {
                binding.handlers.just_released?.(event);
                this.pressedKeybinds.delete(name);
            }
        }
    }

    public getKeybindState(keybind: string): boolean {
        return this.pressedKeybinds.has(keybind);
    }
}