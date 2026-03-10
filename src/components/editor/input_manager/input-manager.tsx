import { BaseNode } from "~/components/nodes/base-node";
import { NodeSlot } from "~/components/nodes/slot/node-slot";
import { ComponentEventHandler } from "../tools/base-tool";
import { createStore, SetStoreFunction } from "solid-js/store";
import { Keybind, KeyEventData, KeyModifiers, MBUTTON_CODES, MouseButtons } from "./keybind-events";
import { EventHandler, InputEvents } from "./event-handling";

export interface KeyHandlersInterface {
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
    event_handlers: Map<InputEvents, Array<EventHandler>>;
    
    private _key_state: { [key: string]: boolean};
    private _set_keys: SetStoreFunction<{[key: string]: boolean}>;

    private _mouse_button_state: { [mouse_button: number]: boolean};
    private _set_mouse_button: SetStoreFunction<{[key: number]: boolean}>;;

    private _modifier_state: { [modifier: number]: boolean};
    private _set_modifier: SetStoreFunction<{[key: number]: boolean}>;;

    constructor() {
        const [keys, setKeys]  = createStore<Record<string, boolean>>({});
        this._key_state = keys;
        this._set_keys = setKeys;

        const [otherStates, setOtherStates]  = createStore<Record<string, boolean>>({
            [InputEvents.POINTER_MOVING]: false
        });

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
        this.event_handlers = new Map();

        const event_keys = Object.values(InputEvents).filter(value => typeof value === "number");
        event_keys.forEach(key => {
            this.event_handlers.set(key, []);
        });
    }
   
    

    public set_event_handler(target_event: InputEvents, handler: EventHandler) {
        const event_handlers = this.event_handlers.get(target_event)
        if (event_handlers == null) {
            return;
        }
        event_handlers.push(handler);
    }

    public set_keybind_handler(keybind: Keybind, handlers: KeyHandlersInterface) {
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

    protected handle_keybinds(data: KeyEventData) {
        this.keybinds.forEach((handler, keybind) => {
            const previous_state = keybind.is_active();
            keybind.maps.forEach(map => {
                map.update_active(
                    this._key_state, 
                    this._mouse_button_state, 
                    this._modifier_state
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
        const handlers = this.event_handlers.get(InputEvents.POINTER_MOVING)
        handlers?.forEach(handler => {
            handler.handler({event: e});
        });
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
        const handlers = this.event_handlers.get(InputEvents.CLICK_ON_NODE)
        handlers?.forEach(handler => {
            handler.handler({node: node});
        });
    }

    onClickOnNodeSlot(slot: NodeSlot): void {
        const handlers = this.event_handlers.get(InputEvents.CLICK_ON_NODE_SLOT)
        handlers?.forEach(handler => {
            handler.handler({slot: slot});
        });
    }

    onHoverNode(node: BaseNode): void {
        const handlers = this.event_handlers.get(InputEvents.HOVER_NODE)
        handlers?.forEach(handler => {
            handler.handler({node: node});
        });
    }

    onHoverSlot(slot: NodeSlot): void {
        const handlers = this.event_handlers.get(InputEvents.HOVER_SLOT)
        handlers?.forEach(handler => {
            handler.handler({slot: slot});
        });
    }

    onHoverBackground(): void {
        const handlers = this.event_handlers.get(InputEvents.HOVER_BACKGROUND)
        handlers?.forEach(handler => {
            handler.handler({});
        });
    }
}