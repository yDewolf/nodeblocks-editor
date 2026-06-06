import { createSignal, JSXElement, Show } from "solid-js";

interface PageView {
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

export const StaticViewDisplayer = (props: {current_page?: PageView}) => {
    if (!props.current_page) {
        return
    }

    return (
        <div class="view-displayer">
            {/* Erm... */}
            {props.current_page.element()}
        </div>
    )
}