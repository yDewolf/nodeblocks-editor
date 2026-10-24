import { contextMenuManager } from "./context-menu-controller";
import { isServer, Portal } from 'solid-js/web';
import { For, onCleanup, onMount, Show } from 'solid-js';
import { ContextMenuItem } from "./context-menu-protocol";

export const ContextMenuPortal = () => {
    const state = contextMenuManager.getState();
    let menuRef!: HTMLDivElement;

    const handleClickOutside = (e: MouseEvent) => {
        if (state.isOpen && menuRef && !menuRef.contains(e.target as Node)) {
            contextMenuManager.close();
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && state.isOpen) {
            contextMenuManager.close();
        }
    };

    onMount(() => {
        if (isServer) return; 
        window.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("keydown", handleKeyDown);
    });

    onCleanup(() => {
        if (isServer) return; 
        window.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("keydown", handleKeyDown);
    });

    return (
        <Portal>
            <Show when={state.isOpen}>
                <div
                    ref={menuRef}
                    class="dropdown-content dropdown-wrapper"
                    style={{
                        position: "fixed",
                        top: `${state.y}px`,
                        left: `${state.x}px`,
                        "z-index": 99999,
                    }}
                >
                    <For each={state.items}>
                        {(item) => (
                            <Show
                                when={!item.separator}
                                fallback={<hr class="context-menu-separator" />}
                            >
                                <ContextMenuItemComponent item={item}/>
                            </Show>
                        )}
                    </For>
                </div>
            </Show>
        </Portal>
    );
};


const ContextMenuItemComponent = (props: {
    item: ContextMenuItem
}) => {
    return (
        <div
            class="dropdown-item row-container align-center space-between"
            classList={{"disabled": props.item.disabled}}
            onclick={() => {
                if (props.item.disabled) return;

                props.item.action?.();
                contextMenuManager.close();
            }}
        >
            <span class="dropdown-label">{props.item.label}</span>
            <Show when={props.item.shortcut}>
                <span class="menu-shortcut">{props.item.shortcut}</span>
            </Show>
        </div>
    )
}