import { createSignal, JSXElement, Show } from "solid-js"

export const DropdownIcon = (props: {expanded: boolean}) => {
    return (
        <img 
            class="dropdown-icon"
            classList={{
                "expanded": props.expanded
            }}
            src="public/assets/icons/arrow-down.svg" alt="drop" 
        />
    )
}

export const DropdownSection = (props: {header: string, content: JSXElement, default_expanded?: boolean}) => {
    const [expanded, setExpanded] = createSignal(props?.default_expanded ?? false);
    return (
        <div class="dropdown-section">
            <div class="section-header">
                <span>{props.header}</span>
                <button class="icon-button section-dropdown-icon" onclick={() => {
                    if (expanded()) setExpanded(false); else setExpanded(true);
                }}>
                    <DropdownIcon expanded={expanded()}/>
                </button>
            </div>
            <Show when={expanded()}>
                <div class="section-body">
                    {props.content}
                </div>
            </Show>
        </div>
    )
}