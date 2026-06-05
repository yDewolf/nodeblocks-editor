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
        <div 
            class="dropdown" 
            classList={{"expanded": expanded(), "no-animation": !props.animated}}
            onFocusOut={() => setExpanded(false)}
        >
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

export const DropdownItemButton = (props: {label: string, onClick: () => void, onMouseOver?: () => void}) => {
    return (
        <button
            onclick={() => {props.onClick()}}
            onMouseOver={() => {props.onMouseOver?.()}}
            class="dropdown-item dropdown-button dropdown-label space-between"
        >
            {props.label}
        </button>
    )
}

export const Dropside = (props: {
    label_element?: JSXElement,
    label?: string,
    content: JSXElement,
    animated?: boolean,
    visible?: () => boolean,
    onMouseEnter?: () => void
}) => {
    const [localVisible, setLocalVisible] = createSignal(true);
    const is_visible = props.visible ?? localVisible;

    const renderContent = () => (
        <Show when={is_visible()}>
            <div 
                class="dropside-wrapper"
                onMouseLeave={() => setLocalVisible(false)}
            >
                <div class="dropside-content">
                    {props.content}
                </div>
            </div>
        </Show>
    );

    return (
        <div 
            class="dropdown-item"
            classList={{
                "expanded": is_visible()
            }}
            onMouseEnter={() => {
                if (props.onMouseEnter) {
                    props.onMouseEnter();
                    return;
                }
                setLocalVisible(true)
            }}
        >
            <div class="dropdown-label space-between">
                <Show when={props.label_element} fallback={
                    <button class="dropdown-button">
                        {props.label}
                    </button>
                }>
                    {props.label_element}
                </Show>
                <ArrowDownIcon class="dropside-icon"/>
            </div>
            <Show when={props.animated} fallback={renderContent()}>
                <Transition name="dropside-fade">
                    {renderContent()}
                </Transition>
            </Show>
        </div>
    );
}

export interface DropsideItemData {
    label_element?: () => JSXElement,
    label?: string,
    content: () => JSXElement,
    animated?: boolean
}

export const DropsideManager = (props: {
    dropsides: Map<string, DropsideItemData>,
    currentItem?: () => string | undefined,
    setCurrentItem?: (item: string | undefined) => void,
}) => {
    const [currentItem, setCurrentItem] = createSignal<string | undefined>(undefined);
    const current_item = props.currentItem ?? currentItem;
    const set_current_item = props.setCurrentItem ?? setCurrentItem;

    return (
        <div class="dropside-manager-container">
            <For each={Array.from(props.dropsides.entries())}>
                {([id, data]) => {
                    return (
                        <Dropside 
                            label_element={data.label_element?.()}
                            label={data.label}
                            content={data.content()}
                            animated={data.animated}
                            visible={() => current_item() === id}
                            onMouseEnter={() => set_current_item(id)}
                        />
                    );
                }}
            </For>
        </div>
    );
};


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
