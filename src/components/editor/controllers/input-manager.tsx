import { BaseNode } from "~/components/nodes/base-node";
import { NodeSlot } from "~/components/nodes/slot/node-slot";
import { ComponentEventHandler } from "../tools/base-tool";

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
    mouse_buttons?: MouseButtons[], 
    keys?: string[], 
    modifiers?: KeyModifiers[]
}

export class KeybindMap {
    private _mouse_buttons: MouseButtons[];
    private _keys: string[];
    private _modifiers: KeyModifiers[];
    public active: boolean = false;

    constructor(binds: KeybindMapBinds) {
        this._mouse_buttons = binds.mouse_buttons == null ? [] : binds.mouse_buttons;
        this._keys = binds.keys == null ? [] : binds.keys;
        this._modifiers = binds.modifiers == null ? [] : binds.modifiers;
    }

    get mouse_buttons() { return this._mouse_buttons; }
    get keys() { return this._keys; }
    get modifiers() { return this._modifiers; }

    public change_active(_mb_states: Map<MouseButtons, boolean>, _key_states: Map<string, boolean>, _modifier_states: Map<KeyModifiers, boolean>) {
        let keybind_states: boolean[] = [];
        
        this._mouse_buttons.forEach(code => {
            const state = _mb_states.get(code)
            keybind_states = [...keybind_states, state == undefined ? false : state]
        });
        this._keys.forEach(code => {
            const state = _key_states.get(code)
            keybind_states = [...keybind_states, state == undefined ? false : state]
        });
        this._modifiers.forEach(code => {
            const state = _modifier_states.get(code)
            keybind_states = [...keybind_states, state == undefined ? false : state]
        });

        if (keybind_states.includes(false)) {
            this.active = false;
            return false;
        }

        this.active = true;
        return true;
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
        let is_active: boolean = false;
        this.maps.forEach(map => {
            if (map.active) {
                is_active = true;
                return;
            }
        });

        return is_active;
    }
}


export interface KeyEventData {
    event: UIEvent
}

export class KeyEventManager implements ComponentEventHandler {
    keybinds: Map<Keybind, (data: KeyEventData) => void>;
    
    _mouse_button_state: Map<MouseButtons, boolean>;
    _key_state: Map<string, boolean>;
    _modifier_state: Map<KeyModifiers, boolean>;

    constructor() {
        this.keybinds = new Map();

        this._mouse_button_state = new Map();
        this._key_state = new Map();
        this._modifier_state = new Map();
    }

    public set_keybind_handler(keybind: Keybind, handler: (data: KeyEventData) => void) {
        this.keybinds.set(keybind, handler);
    }

    protected update_modifier_states(event: KeyboardEvent | MouseEvent) {
        this._modifier_state.set(KeyModifiers.ALT, event.altKey);
        this._modifier_state.set(KeyModifiers.CTRL, event.ctrlKey);
        this._modifier_state.set(KeyModifiers.SHIFT, event.shiftKey);
    }

    protected handle_keybinds(data: KeyEventData) {
        this.keybinds.forEach((handler, keybind) => {
            keybind.maps.forEach(map => {
                map.change_active(
                    this._mouse_button_state, 
                    this._key_state, 
                    this._modifier_state
                );
            });
            if (keybind.is_active()) {
                handler(data);
            }
        });
    }

    onKeyDown(e: KeyboardEvent): void {
        this.update_modifier_states(e);
        this._key_state.set(e.code, true);

        this.handle_keybinds({event: e})
    }
    
    onKeyUp(e: KeyboardEvent): void {
        this.update_modifier_states(e);
        this._key_state.set(e.code, false);

        this.handle_keybinds({event: e})
    }
    
    onWheel(e: WheelEvent): void {
        this.update_modifier_states(e);
        this._mouse_button_state.set(MouseButtons.SCROLL, true);
    
        this.handle_keybinds({event: e})
    }
    
    onPointerDown(e: PointerEvent): void {
        this.update_modifier_states(e);
        MBUTTON_CODES.forEach(button_code => {
            this._mouse_button_state.set(button_code, false);
        })

        this._mouse_button_state.set(e.buttons, true);
        this.handle_keybinds({event: e})
    }

    onPointerUp(e: PointerEvent): void {
        this.update_modifier_states(e);
        MBUTTON_CODES.forEach(button_code => {
            this._mouse_button_state.set(button_code, false);
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