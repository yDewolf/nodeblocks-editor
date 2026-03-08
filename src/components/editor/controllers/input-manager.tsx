import { BaseNode } from "~/components/nodes/base-node";
import { NodeSlot } from "~/components/nodes/slot/node-slot";
import { ComponentEventHandler } from "../tools/base-tool";
import { createSignal } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";

// TODO: Change this to be an Events enum
// then create a set_event_handler function on KeyEventManager
export enum OtherStates {
    POINTER_MOVING
}

export enum MouseButtons {
    NONE = 0,
    LEFT = 1,
    RIGHT = 2,
    MIDDLE = 4,
    SCROLL
}
const MBUTTON_CODES = Object.values(MouseButtons).filter((item): item is number => typeof item === 'number');

export enum KeyModifiers {
    CTRL,
    SHIFT,
    ALT
}

export interface KeybindMapBinds {
    other_states?: OtherStates[], 
    mouse_buttons?: MouseButtons[], 
    keys?: string[], 
    modifiers?: KeyModifiers[]
}

export class KeybindMap {
    private _other_states: OtherStates[];
    private _mouse_buttons: MouseButtons[];
    private _keys: string[];
    private _modifiers: KeyModifiers[];
    private _active: () => boolean;
    private _set_active: (v: boolean) => void;

    constructor(binds: KeybindMapBinds) {
        const [active, setActive] = createSignal(false);
        this._active = active;
        this._set_active = setActive;
        
        this._mouse_buttons = binds.mouse_buttons == null ? [] : binds.mouse_buttons;
        this._other_states = binds.other_states == null ? [] : binds.other_states;
        this._keys = binds.keys == null ? [] : binds.keys;
        this._modifiers = binds.modifiers == null ? [] : binds.modifiers;
    }

    get active() { return this._active(); }
    set active(value: boolean) { this._set_active(value); }

    get mouse_buttons() { return this._mouse_buttons; }
    get keys() { return this._keys; }
    get modifiers() { return this._modifiers; }

    public update_active(keys: Record<string, boolean>, mouse_buttons: Record<number, boolean>, modifiers: Record<number, boolean>, other_states: Record<number, boolean>): boolean {
        const keys_active = this._keys.length > 0 ? this._keys.every(k => !!keys[k]) : true;
        const mb_active = this._mouse_buttons.length > 0 ? this._mouse_buttons.every(m => !!mouse_buttons[m]) : true;
        const mod_active = this._modifiers.length > 0 ? this._modifiers.every(mod => !!modifiers[mod]) : true;
        const other_states_active = this._other_states.length > 0 ? this._other_states.every(state => !!other_states[state]) : true;

        const has_any_bind = this._other_states.length > 0 || this._keys.length > 0 || this._mouse_buttons.length > 0 || this._modifiers.length > 0;
        const is_now_active = has_any_bind && keys_active && mb_active && mod_active && other_states_active;

        if (this.active !== is_now_active) {
            this.active = is_now_active;
        }
        return is_now_active;
    }

    public set_mouse_buttons(buttons: MouseButtons[]) {
        this._mouse_buttons = buttons;
    }

    public set_keys(keys: string[]) {
        this._keys = keys;
    }

    public set_modifiers(modifiers: KeyModifiers[]) {
        this._modifiers = modifiers;
    }
}

export class Keybind {
    keybind_name: string;
    maps: KeybindMap[];

    constructor(name: string, maps: KeybindMap[]) {
        this.keybind_name = name;
        this.maps = maps;
    }

    public add_map(map: KeybindMap) {
        if (this.maps.includes(map)) {
            return;
        }
        this.maps = [...this.maps, map];
    }

    public remove_map(map: KeybindMap) {
        this.maps = this.maps.filter((_map: KeybindMap) => {
            return _map !== map;
        })
    }

    public is_active(): boolean {
        const active = this.maps.some(map => map.active)
        return active;
    }
}


export interface KeyEventData {
    event: UIEvent
}

export interface HandlersInterface {
    just_activated?: (data: KeyEventData) => void;
    while_active?: (data: KeyEventData) => void;
    cleanup?: (data: KeyEventData) => void;
}

class KeyHandlers {
    just_activated_handler: (data: KeyEventData) => void;
    while_active_handler: (data: KeyEventData) => void;
    just_deactivated_handler: (data: KeyEventData) => void;

    constructor(just_activated: (data: KeyEventData) => void, while_active: (data: KeyEventData) => void, just_deactivated: (data: KeyEventData) => void) {
        this.just_activated_handler = just_activated;
        this.while_active_handler = while_active;
        this.just_deactivated_handler = just_deactivated;
    }
}

export class KeyEventManager implements ComponentEventHandler {
    keybinds: Map<Keybind, KeyHandlers>;
    
    private _key_state: { [key: string]: boolean};
    private _set_keys: SetStoreFunction<{[key: string]: boolean}>;

    private _other_states: { [key: string]: boolean};
    private _set_other_states: SetStoreFunction<{[key: string]: boolean}>;

    private _mouse_button_state: { [mouse_button: number]: boolean};
    private _set_mouse_button: SetStoreFunction<{[key: number]: boolean}>;;

    private _modifier_state: { [modifier: number]: boolean};
    private _set_modifier: SetStoreFunction<{[key: number]: boolean}>;;

    constructor() {
        const [keys, setKeys]  = createStore<Record<string, boolean>>({});
        this._key_state = keys;
        this._set_keys = setKeys;

        const [otherStates, setOtherStates]  = createStore<Record<string, boolean>>({
            [OtherStates.POINTER_MOVING]: false
        });
        this._other_states = otherStates;
        this._set_other_states = setOtherStates;

        const [mouse_button, setMouseButton] = createStore<Record<number, boolean>>({});
        this._mouse_button_state = mouse_button;
        this._set_mouse_button = setMouseButton;

        const [modifierState, setModifier] = createStore<Record<number, boolean>>({
            [KeyModifiers.ALT]: false,
            [KeyModifiers.CTRL]: false,
            [KeyModifiers.SHIFT]: false
        });
        this._modifier_state = modifierState;
        this._set_modifier = setModifier;

        this.keybinds = new Map();
    }

    public set_keybind_handler(keybind: Keybind, handlers: HandlersInterface) {
        this.keybinds.set(keybind, new KeyHandlers(
            handlers.just_activated != undefined ? handlers.just_activated : () => {},
            handlers.while_active != undefined ? handlers.while_active : () => {},
            handlers.cleanup != undefined ? handlers.cleanup : () => {}
        ));
    }

    public get_keybind_state(keybind_name: string): boolean {
        const keybind = Array.from(
            this.keybinds.keys()).find( 
                k => k.keybind_name === keybind_name
        );
        
        const active = keybind ? keybind.maps.some(map => map.active) : false;
        return active;
    }


    protected update_modifier_states(event: KeyboardEvent | MouseEvent) {
        this._set_modifier({
            [KeyModifiers.ALT]: event.altKey,
            [KeyModifiers.CTRL]: event.ctrlKey,
            [KeyModifiers.SHIFT]: event.shiftKey
        });
    }

    protected update_other_states(event: PointerEvent) {
        if (event.movementX != 0 || event.movementY != 0) {
            this._set_other_states(OtherStates.POINTER_MOVING, true)
        } else {
            this._set_other_states(OtherStates.POINTER_MOVING, false)
        }
    }

    protected handle_keybinds(data: KeyEventData) {
        this.keybinds.forEach((handler, keybind) => {
            const previous_state = keybind.is_active();
            keybind.maps.forEach(map => {
                map.update_active(
                    this._key_state, 
                    this._mouse_button_state, 
                    this._modifier_state,
                    this._other_states
                );
            });

            if (!previous_state && keybind.is_active()) {
                handler.just_activated_handler(data);
            }

            if (previous_state && keybind.is_active()) {
                handler.while_active_handler(data);
            }

            if (previous_state && !keybind.is_active()) {
                handler.just_deactivated_handler(data);
            }
        });
    }

    onKeyDown(e: KeyboardEvent): void {
        this.update_modifier_states(e);
        this._set_keys(e.code, true);

        this.handle_keybinds({event: e})
    }
    
    onKeyUp(e: KeyboardEvent): void {
        this.update_modifier_states(e);
        this._set_keys(e.code, false);

        this.handle_keybinds({event: e})
    }
    
    onWheel(e: WheelEvent): void {
        this.update_modifier_states(e);
        this._set_mouse_button(MouseButtons.SCROLL, true);
    
        this.handle_keybinds({event: e})
    }
    
    onPointerMove(e: PointerEvent): void {
        this.update_modifier_states(e);
        // this.update_other_states(e);

        this._set_other_states(OtherStates.POINTER_MOVING, true)
        this.handle_keybinds({event: e})
        this._set_other_states(OtherStates.POINTER_MOVING, false)
    }

    onPointerDown(e: PointerEvent): void {
        this.update_modifier_states(e);
        MBUTTON_CODES.forEach(button_code => {
            this._set_mouse_button(button_code, (e.buttons & button_code) !== 0);
        })
        
        this.handle_keybinds({event: e})
    }

    onPointerUp(e: PointerEvent): void {
        this.update_modifier_states(e);
        MBUTTON_CODES.forEach(button_code => {
            this._set_mouse_button(button_code, (e.buttons & button_code) !== 0);
        })

        this.handle_keybinds({event: e})
    }

    onClickOnNode(node: BaseNode): void {
        throw new Error("Method not implemented.");
    }

    onClickOnNodeSlot(slot: NodeSlot): void {
        throw new Error("Method not implemented.");
    }
}