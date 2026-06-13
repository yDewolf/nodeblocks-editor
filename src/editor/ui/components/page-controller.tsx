import { createSignal, JSXElement, Show } from "solid-js";
import CloseIcon from "~/assets/icons/close.svg";

interface PageView {
    page_title: string,
    view_displayer_css?: string,
    icon_element?: () => JSXElement,
    element: () => JSXElement
}

export class PageViewer {
    protected _current_page: () => (PageView) | undefined;
    protected _set_current_page: (element: (PageView) | undefined) => void;
    constructor() {
        const [currentPage, setCurrentPage] = createSignal(undefined);
        this._current_page = currentPage;
        this._set_current_page = setCurrentPage;
    }

    set current_page(element: (PageView) | undefined) { this._set_current_page(element); }
    get current_page() { return this._current_page() }
}

export const StaticViewDisplayer = (props: {page_viewer: PageViewer}) => {
    if (!props.page_viewer.current_page) {
        return
    }

    return (
        <div class={`view-displayer ` + (props.page_viewer.current_page.view_displayer_css ?? "")}>
            <div class="view-header">
                <button class="icon-button" onclick={() => props.page_viewer.current_page = undefined}>
                    <Show when={props.page_viewer.current_page.icon_element} fallback={
                        <CloseIcon class="small-icon" />
                    }>
                        {props.page_viewer.current_page.icon_element?.()}
                    </Show>
                </button>
                <h3>
                    {props.page_viewer.current_page.page_title}
                </h3>
            </div>
            {props.page_viewer.current_page.element()}
        </div>
    )
}