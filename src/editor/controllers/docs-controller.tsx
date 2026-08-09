import { createSignal, createResource, Resource, JSX, createContext, useContext, onCleanup, createEffect, createMemo, Accessor } from "solid-js";
import { docsResolver } from "~/singletons/docs";
import { isServer } from "solid-js/web";
import { DocPayload } from "~/network/controllers/docs/docs-interfaces";
import { getHashParams, setHashParam } from "../utils/url-utils";
import { MetadataStoreData } from "~/network/controllers/metadata/metadata_controller";
import { DocSearchHelper, DocTopic } from "~/network/controllers/docs/docs-helper";
import { makePersisted } from "@solid-primitives/storage";
import { createStore, SetStoreFunction } from "solid-js/store";

const DOCS_STATE_KEY = "app_docs_state";
interface DocsState {
    opened_tabs: string[]
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
    
    constructor() {
        this.allDocs = docsResolver.allData();
        const [docsStore, setDocsStore] = makePersisted(
            createStore<DocsState>({
                opened_tabs: [],
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

const DocsContext = createContext<DocsController>();
export function DocsProvider(props: { children: JSX.Element }) {
    const controller = new DocsController();

    return (
        <DocsContext.Provider value={controller}>
            {props.children}
        </DocsContext.Provider>
    );
}

export function useDocs() {
    const context = useContext(DocsContext);
    if (!context) {
        throw new Error("Not inside a '<DocsProvider/>'");
    }
    return context;
}

export const DocsUrlSync = () => {
    if (isServer) return;

    const docs = useDocs();
    const handleHashChange = () => {
        const params = getHashParams();
        const pathFromUrl = params["docs"];

        if (pathFromUrl !== docs.docs_path) {
            docs.docs_path = pathFromUrl || undefined;
        }
    };

    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    onCleanup(() => window.removeEventListener("hashchange", handleHashChange));

    createEffect(() => {
        const currentPath = docs.docs_path;
        const params = getHashParams();
        const urlPath = params["docs"];

        if (currentPath !== urlPath) {
            setHashParam("docs", currentPath);
        }
    });

    return null;
};