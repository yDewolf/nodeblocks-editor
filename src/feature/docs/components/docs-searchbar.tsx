import { createSignal, createMemo, For, Show } from "solid-js";
import { useDocs } from "~/feature/docs/docs-context";
import { DocSearchHelper } from "~/feature/docs/helpers/docs-helper";
import { DocsHref } from "./docs-reference";
import { useI18n } from "~/i18n/i18n-context";

export const DocSearchBar = (props: {

}) => {
    const { t } = useI18n();

    let containerRef: HTMLDivElement | undefined;
    const [query, setQuery] = createSignal("");
    const [isFocused, setIsFocused] = createSignal(false);
    const docs = useDocs();

    const searchResults = createMemo(() => DocSearchHelper.search_topic(docs.doc_topics, query()));
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
                placeholder={t("pages.docs.messages.searchForTopics")}
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
                        {(topic) => (
                            <DocsHref route={{path: topic.path}} onclick={() => setQuery("")}>
                                <div class="row-container space-between center-items">
                                    <span class="search-result-title">{topic.capitalized_name}</span>
                                    <span class="search-result-root">
                                        {topic.type} ({topic.root_id})
                                    </span>
                                </div>
                                <Show when={topic.description}>
                                    <p class="search-result-description">{topic.description}</p>
                                </Show>
                            </DocsHref>
                        )}
                    </For>
                </div>
            </Show>
        </div>
    );
};