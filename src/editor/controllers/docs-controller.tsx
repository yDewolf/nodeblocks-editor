import { createSignal, createResource, Resource, createMemo, Accessor } from "solid-js";
import { docsResolver } from "~/singletons/docs";
import { isServer } from "solid-js/web";
import { DocPayload } from "~/network/controllers/docs/docs-interfaces";
import { MetadataStoreData } from "~/network/controllers/metadata/metadata_controller";
import { DocSearchHelper, DocTopic } from "~/network/controllers/docs/docs-helper";
import { makePersisted } from "@solid-primitives/storage";
import { createStore, SetStoreFunction } from "solid-js/store";
import { DocsPathUtils, DocsRoute } from "~/helpers/docs-path-utils";

const DOCS_STATE_KEY = "app_docs_state";
interface DocsState {
    opened_tabs: string[],
    is_docs_page_opened: boolean
}


export class DocsController {
    public readonly state_store: DocsState;
    private setStore: SetStoreFunction<DocsState>;

    get opened_tabs() { return this.state_store.opened_tabs }
    private set opened_tabs(value: string[]) { this.setStore("opened_tabs", value) }
    
    get is_docs_page_opened() { return this.state_store.is_docs_page_opened; }
    set is_docs_page_opened(value: boolean) { this.setStore("is_docs_page_opened", value) }

    public hoveredDocElement: () => HTMLElement | null;
    public setHoveredDocElement: (element: HTMLElement | null) => void;

    public selectedDocElement: () => HTMLElement | null;
    public setSelectedDocElement: (element: HTMLElement | null) => void;

    protected _doc_topics: Accessor<DocTopic[]>;
    get doc_topics() { return this._doc_topics(); }

    private _docs_route: () => DocsRoute | undefined;
    private _set_docs_route: (route: DocsRoute | undefined) => void;
    get route() { return this._docs_route(); }
    protected set route(new_route: DocsRoute | undefined) { 
        this._set_docs_route(new_route); 

        if (new_route) {
            if (!this.opened_tabs.find((value) => value === new_route.path)) {
                this.opened_tabs = [...this.opened_tabs, new_route.path];
            }
        }
    }

    get docs_path() { return this.route?.path; }
    set docs_path(path: string | undefined) { 
        if (!path) {
            this.route = undefined;
            return
        };

        this.route = {path: path}
    }
    
    public docsData: Resource<DocPayload | undefined>;
    public allDocs: Record<string, MetadataStoreData>;
    
    constructor() {
        this.allDocs = docsResolver.allData();
        const [docsStore, setDocsStore] = makePersisted(
            createStore<DocsState>({
                opened_tabs: [],
                is_docs_page_opened: false,
            }),
            { name: DOCS_STATE_KEY }
        );
        this.state_store = docsStore;
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

        const [_docs_route, _set_docs_route] = createSignal<DocsRoute | undefined>(undefined);
        this._docs_route = _docs_route;
        this._set_docs_route = _set_docs_route;
    
        // Resources and Memos
        const currentPathMemo = createMemo(() => this.route?.path);
        const docsDataResource = createResource(currentPathMemo, async (path) => {
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

    get currentRootId(): string | undefined {
        if (this.docs_path) {
            return DocsPathUtils.extractRootId(this.docs_path);
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

    public navigateToSection(route: DocsRoute | undefined) {
        if (!route) { return; }
        if (route.section) {
            requestAnimationFrame(() => {
                const element = document.getElementById(route.section!);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                    element.classList.add("highlight-section");
                    setTimeout(() => element.classList.remove("highlight-section"), 500);
                }
            });
        }
    }

    public removeFromHistory(path: string) {
        const filtered = this.opened_tabs.filter((value: string) => value != path);
        this.opened_tabs = filtered;
    }

    public setRoute(route: DocsRoute | undefined) {
        this.route = route;
    }
}
