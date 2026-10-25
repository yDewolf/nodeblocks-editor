import { InputContext, KeybindBinding } from "./input-context";
import { createSignal, Setter } from "solid-js";
import { KeybindEvent, IKeybindEvent, createKeybindEvent } from "./keybind-event";

// FIXME: talvez isso aqui tenha que se tornar um singleton
export class InputManager {
    private activeContext: InputContext | null = null;

    private _pressedKeybinds: () => Set<string>;
    private _setPressedKeybinds: Setter<Set<string>>;

    private pressedKeys: Set<string> = new Set();
    private pressedMouseButtons: Set<number> = new Set();

    private _blockContextMenuFlag: boolean = false;

    constructor() {
        [this._pressedKeybinds, this._setPressedKeybinds] = createSignal<Set<string>>(new Set());
    }

    private get pressedKeybinds() { return this._pressedKeybinds(); }

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

    public onPointerDown(event: PointerEvent, updateStateOnly: boolean = false): void {
        this.pressedMouseButtons.add(event.button);
        this.evaluatePress(event, updateStateOnly);
    }

    public onPointerUp(event: PointerEvent, updateStateOnly: boolean = false): void {
        this.pressedMouseButtons.delete(event.button);
        this.evaluateRelease(event, updateStateOnly);
    }

    public onWheel(event: WheelEvent, updatePressedOnly: boolean = false): void {
        this.evaluatePress(event, updatePressedOnly);
        this.evaluateRelease(event, updatePressedOnly);
    }

    public onMouseMove(nativeEvent: PointerEvent): void {
        const event = createKeybindEvent(nativeEvent);
        const bindings = this.getActiveBindings();
        for (const name of this.pressedKeybinds) {
            const binding = bindings.get(name);
            if (binding?.handlers.handle_while_active) {
                binding.handlers.handle_while_active(event);
            }
        }
    }

    public onKeyDown(event: KeyboardEvent, updateStateOnly: boolean = false): void {
        this.pressedKeys.add(event.code);
        this.evaluatePress(event, updateStateOnly);
    }

    public onKeyUp(event: KeyboardEvent, updateStateOnly: boolean = false): void {
        this.pressedKeys.delete(event.code);
        this.evaluateRelease(event, updateStateOnly);
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

    private evaluatePress(nativeEvent: Event, updatePressedOnly: boolean): void {
        const event = createKeybindEvent(nativeEvent);
        const bindings = this.getActiveBindings();
        
        for (const [name, binding] of bindings.entries()) {
            if (event.isNextKeybindsBlocked()) { break; }

            const isSatisfied = binding.triggers.some(trigger => 
                trigger.isSatisfied(this.pressedKeys, this.pressedMouseButtons, nativeEvent)
            );

            if (!isSatisfied) continue;

            const handlers = binding.handlers;
            if (!this.pressedKeybinds.has(name)) {
                this.addPressedKeybind(name);

                handlers.pressed_updateEventState?.(event);
                if (!updatePressedOnly) {
                    handlers.handle_just_activated?.(event);
                }
                continue;
            }

            if (!updatePressedOnly) {
                handlers.handle_while_active?.(event);
            }
        }
    }

    private evaluateRelease(nativeEvent: Event, updateReleasedOnly: boolean): void {
        const event = createKeybindEvent(nativeEvent);
        const bindings = this.getActiveBindings();
        for (const name of this.pressedKeybinds) {
            if (event.isNextKeybindsBlocked()) { break; }

            const binding = bindings.get(name);
            if (!binding) continue;

            const stillActive = binding.triggers.some(trigger => 
                trigger.isSatisfied(this.pressedKeys, this.pressedMouseButtons, event.nativeEvent)
            );

            if (!stillActive) {
                binding.handlers.released_updateEventState?.(event);
                binding.handlers.handle_just_released?.(event);
                if (!updateReleasedOnly) {
                    this.deletePressedKeybind(name);
                }
            }
        }
    }

    private addPressedKeybind(key: string) {
        this._setPressedKeybinds(prev => {
            const next = new Set(prev);
            next.add(key);
            return next;
        })
    }

    private deletePressedKeybind(key: string) {
        this._setPressedKeybinds(prev => {
            const next = new Set(prev);
            next.delete(key);
            return next;
        })
    }

    public getKeybindState(keybind: string): boolean {
        return this.pressedKeybinds.has(keybind);
    }
}