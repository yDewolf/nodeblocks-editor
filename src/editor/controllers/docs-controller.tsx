import { createSignal, createResource, Resource, JSX, createContext, useContext, onCleanup, createEffect } from "solid-js";
import { docsResolver } from "~/singletons/docs";
import { isServer } from "solid-js/web";
import { DocPayload } from "~/network/controllers/docs/docs-interfaces";
import { getHashParams, setHashParam } from "../utils/url-utils";
import { MetadataStoreData } from "~/network/controllers/metadata/metadata_controller";

export class DocsController {
    public hoveredDocElement: () => HTMLElement | null;
    public setHoveredDocElement: (element: HTMLElement | null) => void;

    public selectedDocElement: () => HTMLElement | null;
    public setSelectedDocElement: (element: HTMLElement | null) => void;

    private _current_docs_path: () => string | undefined;
    private _set_current_docs_path: (path: string | undefined) => void;

    // TODO: keep this history on localStorage
    private _docs_history: () => string[];
    private _set_docs_history: (value: string[]) => void;

    get docs_history() { return this._docs_history(); }
    private set docs_history(value: string[]) { this._set_docs_history(value); }
    public removeFromHistory(path: string) {
        const filtered = this.docs_history.filter((value: string) => value != path);
        this.docs_history = filtered;
    }

    get docs_path() { return this._current_docs_path(); }
    set docs_path(path: string | undefined) { 
        this._set_current_docs_path(path);

        if (!path) return;
        if (!this.docs_history.find((value) => value === path)) {
            this.docs_history = [...this.docs_history, path];
        }
    }

    public docsData: Resource<DocPayload | undefined>;
    public allDocs: Record<string, MetadataStoreData>;

    constructor() {
        const [hoveredDocElement, setHoveredDocElement] = createSignal<HTMLElement | null>(null);
        this.hoveredDocElement = hoveredDocElement;
        this.setHoveredDocElement = setHoveredDocElement;

        const [selectedDocElement, setSelectedDocElement] = createSignal<HTMLElement | null>(null);
        this.selectedDocElement = selectedDocElement;
        this.setSelectedDocElement = setSelectedDocElement;

        const [_current_docs_path, _set_current_docs_path] = createSignal<string | undefined>(undefined);
        this._current_docs_path = _current_docs_path;
        this._set_current_docs_path = _set_current_docs_path;
    
        const [docsHistory, setDocsHistory] = createSignal<string[]>([]);
        this._docs_history = docsHistory;
        this._set_docs_history = setDocsHistory;


        this.allDocs = docsResolver.allData();
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