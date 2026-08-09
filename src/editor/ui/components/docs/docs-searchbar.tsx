import { createSignal, createMemo, For, Show } from "solid-js";
import { useDocs } from "~/editor/controllers/docs-controller";
import { DocSearchHelper } from "~/network/controllers/docs/docs-helper";
import { DocsHref } from "./docs-reference";

export const DocSearchBar = (props: {

}) => {
    const [query, setQuery] = createSignal("");
    const [isFocused, setIsFocused] = createSignal(false);
    const docs = useDocs();

    const searchResults = createMemo(() => DocSearchHelper.search_topic(docs.doc_topics, query()));

    return (
        <div class="fill doc-search-container" onfocusout={() => {
            setIsFocused(false);
        }}>
            <input
                onfocusin={() => {
                    setIsFocused(true);
                }}
                class="fill doc-search-bar"
                classList={{
                    "dropdown-visible": query().trim().length > 0
                }}
                type="text"
                placeholder="Search for topics"
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
                        <div>No topic found</div>
                    }>
                        {(topic) => (
                            <DocsHref path={topic.path} onclick={() => setQuery("")}>
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