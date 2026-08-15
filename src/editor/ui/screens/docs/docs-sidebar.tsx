import { createEffect, createMemo, For, Match, Switch } from 'solid-js';
import { useDocs } from "~/editor/controllers/docs-controller";
import { DocPayload, DocsPathPrefix } from "~/network/controllers/docs/docs-interfaces";
import { MetadataStoreData } from "~/network/controllers/metadata/metadata_controller";
import { DropdownSection } from "../../components/panels/dropdown";
import { MetadataStoreSubContent } from "./docs-components";
import { DocsPathSplitter } from '~/singletons/metadata';
import CloseIcon from '~/assets/icons/close.svg';
import { DocSearchBar } from '../../components/docs/docs-searchbar';
import { DocsHref } from '../../components/docs/docs-reference';

export const DocsSidebar = (props: {
    docs_data?: DocPayload
}) => {
    const docs = useDocs();
    const loaded_docs = createMemo(() => {
        return Object.keys(docs.allDocs);
    });
    
    const make_id_from_path = (path: string) => {
        return "index-" + path
    }
    createEffect(() => {
        if (docs.docs_path) {
            const docs_link = document.getElementById(make_id_from_path(docs.docs_path));
            if (!docs_link) return;
            docs_link.scrollIntoView({ behavior: "smooth"})
        }
    });
    return (
        <div class="docs-sidebar">
            <div class="docs-index fill keep container">
                <DocSearchBar />
                <div class="scrollable fill keep container">
                    <For each={loaded_docs()}>
                        {(type_id, idx) => {
                            const data = docs.allDocs[type_id];
                            return (
                                <DropdownSection 
                                    dropdown_class="list"
                                    header={type_id}
                                    header_class=""
                                    content={
                                        <MetadataContentIndex data={data} root_id={type_id}/>
                                    }
                                />
                            )
                        }}
                    </For>
                </div>
            </div>
            <div class="tab-history scrollable keep fill container">
                <Switch fallback={
                    <p>Previous tabs will show up here</p>
                }>
                    <Match when={docs.opened_tabs.length > 0}>
                        <For each={docs.opened_tabs.toReversed()}>
                            {(path: string) => {
                                const final_target = path.split(DocsPathSplitter).at(-1);
                                let reduced_path = path;
                                if (final_target) {
                                    if (!docs.opened_tabs.find((other_path: string) => other_path.endsWith(final_target) && other_path != path)) {
                                        console.log("reducing path: ", path);
                                        reduced_path = final_target;
                                    }
                                }
                                return (
                                    <div class="fill row-container space-between docs-href-container">
                                        <DocsHref class="fill" path={path} id={make_id_from_path(path)}
                                            classList={{
                                                "selected": docs.docs_path == path
                                            }}
                                        >{reduced_path}</DocsHref>
                                        <button class="icon-button" onclick={() => {
                                            docs.removeFromHistory(path);
                                        }}>
                                            <CloseIcon class="smaller-icon"/>
                                        </button>
                                    </div>
                                )
                            }}
                        </For>
                    </Match>
                </Switch>
            </div>
        </div>
    )
}

export const MetadataContentIndex = (props: {
    root_id: string,
    data: MetadataStoreData
}) => {
    return <div class="fill container">
        {/* Procedural way of generating these dropdowns */}
        {/* <For each={Object.keys(props.data)}>
            {(key: string) => {
                return (
                    <TypeSubgroup data={(props.data as Record<string, any>)[key]} header={key} docs_prefix={PathPrefixMap[key]} root_id={props.root_id}/>
                )
            }}
        </For> */}

        <DocsHref  path={props.root_id}>header</DocsHref>
        <MetadataStoreSubContent data={props.data.data_types} header="datatypes" docs_prefix={DocsPathPrefix.DATATYPE} root_id={props.root_id}/>
        <MetadataStoreSubContent data={props.data.node_types} header="nodetypes" docs_prefix={DocsPathPrefix.NODE} root_id={props.root_id}/>
        <MetadataStoreSubContent data={props.data.interface} header="interface" docs_prefix={DocsPathPrefix.UI} root_id={props.root_id}/>
    </div>
}
