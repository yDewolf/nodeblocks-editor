import { createMemo, createSignal, For, JSXElement, Show } from "solid-js";
import { useI18n } from "~/i18n/i18n-context";

export function SearchBar<T = object>(
    search: (query: string) => T[], 
    searchResultComponent: (result: T, setQuery: (v: string) => void) => JSXElement,
    searchPlaceholder?: string
) {
    const { t } = useI18n();

    const placeholder = searchPlaceholder ?? t("pages.docs.messages.searchForTopics")
    let containerRef: HTMLDivElement | undefined;
    const [query, setQuery] = createSignal("");
    const [isFocused, setIsFocused] = createSignal(false);
    const searchResults = createMemo(() => search(query()));

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
                placeholder={placeholder}
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
                        <div>{t("pages.docs.messages.noTopicFound")}</div>
                    }>
                        {(result) => searchResultComponent(result, setQuery)}
                    </For>
                </div>
            </Show>
        </div>
    );
}
