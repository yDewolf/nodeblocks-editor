import { createContext, useContext, ParentComponent, createEffect, onCleanup } from "solid-js";
import { InputContext, KeybindHandlers } from "./input-context";
import { InputManager } from "./input-manager";
import { KeybindTrigger } from "./keybind-trigger";

const InputManagerContext = createContext<InputManager>();
const InputContextContainer = createContext<InputContext>();

export const useInputManager = () => {
    const manager = useContext(InputManagerContext);
    if (!manager) throw new Error("useInputManager must be called inside an InputManagerProvider");
    return manager;
};

export const useParentInputContext = () => useContext(InputContextContainer);

export const InputManagerProvider: ParentComponent<{ manager: InputManager }> = (props) => {
    return (
        <InputManagerContext.Provider value={props.manager}>
            {props.children}
        </InputManagerContext.Provider>
    );
};

export const InputScope: ParentComponent<{ name: string }> = (props) => {
    const parentContext = useParentInputContext();
    const inputManager = useInputManager();

    const currentContext = new InputContext(props.name, parentContext);

    createEffect(() => {
        inputManager.setActiveContext(currentContext);
        onCleanup(() => {
            if (parentContext) {
                inputManager.setActiveContext(parentContext);
            }
        });
    });

    return (
        <InputContextContainer.Provider value={currentContext}>
            {props.children}
        </InputContextContainer.Provider>
    );
};

export function useKeybind(name: string, trigger: KeybindTrigger, handlers: KeybindHandlers) {
    const context = useContext(InputContextContainer);
    if (!context) {
        console.warn(`useKeybind('${name}') called outside of <InputScope>.`);
        return;
    }

    context.bind(name, trigger, handlers);
    onCleanup(() => {
        context.unbind(name);
    });
}
