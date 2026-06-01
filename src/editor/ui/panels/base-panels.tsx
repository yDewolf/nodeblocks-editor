import { createSignal, For, JSXElement, Show } from "solid-js"

export const DropdownIcon = (props: {expanded: boolean, icon_path?: string, css_class?: string}) => {
    const icon_path = props.icon_path ?? "public/assets/icons/arrow-down.svg";
    return (
        <img 
            class={`dropdown-icon ${props.css_class}`}
            classList={{
                "default-icon": !props.icon_path,
                "expanded": props.expanded
            }}
            src={icon_path} alt="drop" 
        />
    )
}

export const DropdownSection = (props: {
    header?: string, 
    header_class?: string,
    dropdown_class?: string, 
    body_class?: string, 

    content: JSXElement, 
    header_content?: () => JSXElement, 
    default_expanded?: boolean, 
    icon_path?: string,
    icon_class?: string,
    no_button?: boolean
}) => {
    const [expanded, setExpanded] = createSignal(props?.default_expanded ?? false);
    const no_button = props.no_button ?? false;
    return (
        <div class={`dropdown-section ${props.dropdown_class ?? ""}`} classList={{"expanded": expanded()}}>
            <div class={`section-header ${props.header_class ?? ""}`} classList={{"expanded": expanded()}}>
                <Show when={props.header_content} fallback={<span>{props.header}</span>}>
                    {props.header_content?.()}
                </Show>
                <Show when={!no_button}>
                    <button class="icon-button section-dropdown-icon" onclick={() => {
                        setExpanded(!expanded());
                    }}>
                        <DropdownIcon expanded={expanded()} icon_path={props.icon_path} css_class={props.icon_class}/>
                    </button>
                </Show>
            </div>
            <Show when={expanded()}>
                <div class={`section-body ${props.body_class ?? ""}`}>
                    {props.content}
                </div>
            </Show>
        </div>
    )
}

export const Dropdown = (props: {content: JSXElement}) => {
    const [expanded, setExpanded] = createSignal(false);
    return (
        <div class="dropdown" classList={{"expanded": expanded()}}>
            <div class="dropdown-header" classList={{"expanded": expanded()}}>
                <button class="icon-button section-dropdown-icon" onclick={() => {
                    if (expanded()) setExpanded(false); else setExpanded(true);
                }}>
                    <DropdownIcon expanded={expanded()}/>
                </button>
            </div>
            <Show when={expanded()}>
                <div class="dropdown-content">
                    {props.content}
                </div>
            </Show>
        </div>
    )
}


export const TabDisplayer = (props: {
    tabs: Record<string, () => JSXElement>, 
    selected_tab: () => string,
    css_class?: string
}) => {
    return (
        <div class={`tab-displayer ${props.css_class}`}>
            {props.tabs[props.selected_tab()]?.()}
        </div>
    )
}

export const TabSelector = (props: {
    tabs: Record<string, () => JSXElement>, 
    set_selected_tab: (tab: string) => void, 
    selected_tab: () => string,
    selector_class?: string,
    tab_displayer_class?: string
}) => {
    return (
        <div class={`tab-container`}>
            <div class={`keep row-container tab-selector ${props.selector_class}`}>
                <For each={Object.keys(props.tabs)}>
                    {(tab) => {
                        return (
                            <button 
                                class="tab-button"
                                classList={{
                                    "selected": props.selected_tab() == tab
                                }}
                                onclick={() => props.set_selected_tab(tab)}
                                >
                                {tab}
                            </button>
                        )
                    }}
                </For>
            </div>
            <TabDisplayer css_class={props.tab_displayer_class} tabs={props.tabs} selected_tab={props.selected_tab}/>
        </div>
    )
}
