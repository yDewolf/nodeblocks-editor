import { InputContext, KeybindBinding } from "./input-context";

// FIXME: talvez isso aqui tenha que se tornar um singleton
export class InputManager {
    private activeContext: InputContext | null = null;
    private pressedKeybinds: Set<string> = new Set();

    private pressedKeys: Set<string> = new Set();
    private pressedMouseButtons: Set<number> = new Set();

    private _blockContextMenuFlag: boolean = false;

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
        this.pressedMouseButtons.add(event.button)
        this.evaluatePress(event);
    }

    public onPointerUp(event: PointerEvent): void {
        this.pressedMouseButtons.delete(event.button);
        this.evaluateRelease(event);
    }

    public onWheel(event: WheelEvent): void {
        this.evaluatePress(event);
        this.evaluateRelease(event);
    }

    public onMouseMove(event: PointerEvent): void {
        const bindings = this.getActiveBindings();
        for (const name of this.pressedKeybinds) {
            console.log(name);
            const binding = bindings.get(name);
            if (binding?.handlers.while_active) {
                binding.handlers.while_active(event);
            }
        }
    }

    public onKeyDown(event: KeyboardEvent): void {
        this.pressedKeys.add(event.code);
        this.evaluatePress(event);
    }

    public onKeyUp(event: KeyboardEvent): void {
        this.pressedKeys.delete(event.code);
        this.evaluateRelease(event);
    }

    public onContextMenu(event: MouseEvent): void {
        if (this.consumeContextMenuBlock()) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        if (!event.defaultPrevented) {
            this.getActiveContext()?.contextHandler?.(event);
        }
    }


    public consumeContextMenuBlock(): boolean {
        if (this._blockContextMenuFlag) {
            this._blockContextMenuFlag = false;
            return true;
        }
        return false;
    }

    public blockNextContextMenu() {
        this._blockContextMenuFlag = true;
    }

    // Evaluators

    private evaluatePress(event: Event): void {
        const bindings = this.getActiveBindings();
        for (const [name, binding] of bindings.entries()) {
            const isSatisfied = binding.triggers.some(trigger => 
                trigger.isSatisfied(this.pressedKeys, this.pressedMouseButtons, event)
            );

            if (isSatisfied) {
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

    private evaluateRelease(event: Event): void {
        const bindings = this.getActiveBindings();
        for (const name of this.pressedKeybinds) {
            const binding = bindings.get(name);
            if (binding) {
                const stillActive = binding.triggers.some(trigger => 
                    trigger.isSatisfied(this.pressedKeys, this.pressedMouseButtons, event)
                );

                if (!stillActive) {
                    binding.handlers.just_released?.(event);
                    this.pressedKeybinds.delete(name);
                }
            }
        }
    }

    public getKeybindState(keybind: string): boolean {
        return this.pressedKeybinds.has(keybind);
    }
}