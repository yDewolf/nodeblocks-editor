import { Component, createSignal, For, JSX, JSXElement, Show } from "solid-js"
import { Transition } from "solid-transition-group";
import ArrowDownIcon from "~/assets/icons/arrow-down.svg";

export const DropdownIcon = (props: {expanded: boolean, icon?: () => JSXElement, css_class?: string}) => {
    const icon_path = props.icon ?? "public/assets/icons/arrow-down.svg";
    return (
        <Show when={props.icon} fallback={
            <ArrowDownIcon
                class={`dropdown-icon ${props.css_class}`}
                classList={{
                    "default-icon": !props.icon,
                    "expanded": props.expanded
                }}
            />
        }>
            {props.icon?.()}
        </Show>
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
    icon?: () => JSXElement,
    icon_class?: string,
    no_button?: boolean,
    expanded_states?: [() => boolean, (value: boolean) => void]
}) => {
    const [expanded, setExpanded] = props.expanded_states ?? createSignal(props?.default_expanded ?? false);
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
                        <DropdownIcon expanded={expanded()} icon={props.icon} css_class={props.icon_class}/>
                    </button>
                </Show>
            </div>
            <div class={`section-body ${props.body_class ?? ""}`}>
            <Transition name="slide-fade">
                <Show when={expanded()}>
                    {props.content}
                </Show>
            </Transition>
            </div>
        </div>
    )
}

export const Dropdown = (props: {content: JSXElement, animated?: boolean}) => {
    const [expanded, setExpanded] = createSignal(false);
    const renderContent = () => (
        <Show when={expanded()}>
            <div class="dropdown-wrapper">
                <div class="dropdown-content">
                    {props.content}
                </div>
            </div>
        </Show>
    )
    return (
        <div class="dropdown" classList={{"expanded": expanded(), "no-animation": !props.animated}}>
            <div class="dropdown-header" classList={{"expanded": expanded()}}>
                <button class="icon-button section-dropdown-icon" onclick={() => {
                    if (expanded()) setExpanded(false); else setExpanded(true);
                }}>
                    <DropdownIcon expanded={expanded()}/>
                </button>
            </div>
            <Show when={props.animated} fallback={
                renderContent()
            }>
                <Transition name={"dropdown-slide"} >
                    {renderContent()}
                </Transition>
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
