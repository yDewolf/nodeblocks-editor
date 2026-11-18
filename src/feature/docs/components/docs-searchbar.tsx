import { Show } from "solid-js";
import { useDocs } from "~/feature/docs/docs-context";
import { DocSearchHelper } from "~/feature/docs/helpers/docs-helper";
import { DocsHref } from "./docs-reference";
import { useI18n } from "~/i18n/i18n-context";
import { SearchBar } from "~/components/search-bar";
import { DocTopic } from '../helpers/docs-helper';

export const DocSearchBar = () => {
    const { t } = useI18n();
    const docs = useDocs();
    const searchbar = SearchBar<DocTopic>(
        (query) => DocSearchHelper.search_topic(docs.doc_topics, query), 
        (topic, setQuery) => (
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
        ),
        t("pages.docs.messages.searchForTopics")
    );

    return searchbar;
};