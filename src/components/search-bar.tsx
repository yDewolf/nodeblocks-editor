import { Accessor, createMemo, createSignal, For, JSXElement, Setter, Show } from "solid-js";
import { useI18n } from "~/i18n/i18n-context";

export function SearchBar<T = object>(props: {
    search: (query: string) => T[], 
    searchResultComponent: (result: T, setQuery: (v: string) => void) => JSXElement,
    searchPlaceholder?: string,
    searchResultsAccessor?: Accessor<T[]>,
    querySignal?: [Accessor<string>, Setter<string>]

}) {
    const { t } = useI18n();

    let containerRef: HTMLDivElement | undefined;
    const [query, setQuery] = props.querySignal ?? createSignal("");
    const [isFocused, setIsFocused] = createSignal(false);
    const searchResults = props.searchResultsAccessor ?? createMemo(() => props.search(query()));

    const handleOnFocusOut = (e: FocusEvent) => {
        const nextTarget = e.relatedTarget as Node
        if (!nextTarget || !containerRef?.contains(nextTarget)) {
            setIsFocused(false);
        }
    }

    return (
        <div 
            ref={containerRef}
            class="fill search-container" 
            onFocusOut={handleOnFocusOut}
        >
            <input
                onFocusOut={handleOnFocusOut}
                onfocusin={() => {
                    setIsFocused(true);
                }}
                class="fill search-bar"
                classList={{
                    "dropdown-visible": query().trim().length > 0
                }}
                type="text"
                placeholder={props.searchPlaceholder ?? t("components.searchbar.searchPlaceholder")}
                value={query()}
                onInput={(e) => setQuery(e.currentTarget.value)}
            />
            <Show when={query().trim().length > 0}>
                <div 
                    class="scrollable container search-results-dropdown"
                    classList={{
                        "unfocused": !isFocused()
                    }}
                >
                    <For each={searchResults()} fallback={
                        <div>{t("components.searchbar.noResultsForQuery")}</div>
                    }>
                        {(result) => props.searchResultComponent(result, setQuery)}
                    </For>
                </div>
            </Show>
        </div>
    );
}
