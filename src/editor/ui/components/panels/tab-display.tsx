import { JSXElement, For } from "solid-js"

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
