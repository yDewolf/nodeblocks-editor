import { createSignal, createResource, Resource, createMemo, Accessor } from "solid-js";
import { docsResolver } from "~/singletons/docs";
import { isServer } from "solid-js/web";
import { DocPayload } from "~/network/controllers/docs/docs-interfaces";
import { MetadataStoreData } from "~/network/controllers/metadata/metadata_controller";
import { DocSearchHelper, DocTopic } from "~/network/controllers/docs/docs-helper";
import { makePersisted } from "@solid-primitives/storage";
import { createStore, SetStoreFunction } from "solid-js/store";
import { DocsPathSplitter } from "~/singletons/metadata";

const DOCS_STATE_KEY = "app_docs_state";
interface DocsState {
    opened_tabs: string[],
    is_docs_page_opened: boolean
}


export class DocsController {
    public readonly store: DocsState;
    private setStore: SetStoreFunction<DocsState>;

    public hoveredDocElement: () => HTMLElement | null;
    public setHoveredDocElement: (element: HTMLElement | null) => void;

    public selectedDocElement: () => HTMLElement | null;
    public setSelectedDocElement: (element: HTMLElement | null) => void;

    private _current_docs_path: () => string | undefined;
    private _set_current_docs_path: (path: string | undefined) => void;

    protected _doc_topics: Accessor<DocTopic[]>;
    get doc_topics() { return this._doc_topics(); }

    get opened_tabs() { return this.store.opened_tabs }
    private set opened_tabs(value: string[]) { this.setStore("opened_tabs", value) }
    
    get is_docs_page_opened() { return this.store.is_docs_page_opened; }
    set is_docs_page_opened(value: boolean) { this.setStore("is_docs_page_opened", value) }

    public removeFromHistory(path: string) {
        const filtered = this.opened_tabs.filter((value: string) => value != path);
        this.opened_tabs = filtered;
    }

    get docs_path() { return this._current_docs_path(); }
    set docs_path(path: string | undefined) { 
        this._set_current_docs_path(path);

        if (!path) return;
        if (!this.opened_tabs.find((value) => value === path)) {
            this.opened_tabs = [...this.opened_tabs, path];
        }
    }

    public docsData: Resource<DocPayload | undefined>;
    public allDocs: Record<string, MetadataStoreData>;


    get currentRootId(): string | undefined {
        const splitted = this.docs_path?.split(DocsPathSplitter);
        if (splitted) {
            return splitted.at(0);
        }
        return undefined;
    }
    get currentRoot(): MetadataStoreData | undefined {
        if (this.currentRootId && this.currentRootId in this.allDocs) {
            const store_data = this.allDocs[this.currentRootId];
            return store_data;
        }
        return undefined;
    }
    
    constructor() {
        this.allDocs = docsResolver.allData();
        const [docsStore, setDocsStore] = makePersisted(
            createStore<DocsState>({
                opened_tabs: [],
                is_docs_page_opened: false,
            }),
            { name: DOCS_STATE_KEY }
        );
        this.store = docsStore;
        this.setStore = setDocsStore;
        this._doc_topics = createMemo(() => {
            return DocSearchHelper.get_doc_topics(this.allDocs);
        });

        // Signals
        const [hoveredDocElement, setHoveredDocElement] = createSignal<HTMLElement | null>(null);
        this.hoveredDocElement = hoveredDocElement;
        this.setHoveredDocElement = setHoveredDocElement;

        const [selectedDocElement, setSelectedDocElement] = createSignal<HTMLElement | null>(null);
        this.selectedDocElement = selectedDocElement;
        this.setSelectedDocElement = setSelectedDocElement;

        const [_current_docs_path, _set_current_docs_path] = createSignal<string | undefined>(undefined);
        this._current_docs_path = _current_docs_path;
        this._set_current_docs_path = _set_current_docs_path;
    
        // Resources and Memos
        const docsDataResource = createResource(_current_docs_path, async (path) => {
            if (!path || isServer) {
                return undefined;
            }
            try {
                const data = await docsResolver.resolve(path);
                return data;
            } catch (e) {
                console.warn(e);
                return undefined;
            }
        });
        this.docsData = docsDataResource[0];
    }
}
