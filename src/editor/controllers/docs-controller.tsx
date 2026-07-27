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

    public currentDocsPath: () => string | undefined;
    public setCurrentDocsPath: (path: string | undefined) => void;

    public docsData: Resource<DocPayload | undefined>;
    public allDocs: Record<string, MetadataStoreData>;

    constructor() {
        const [hoveredDocElement, setHoveredDocElement] = createSignal<HTMLElement | null>(null);
        this.hoveredDocElement = hoveredDocElement;
        this.setHoveredDocElement = setHoveredDocElement;

        const [selectedDocElement, setSelectedDocElement] = createSignal<HTMLElement | null>(null);
        this.selectedDocElement = selectedDocElement;
        this.setSelectedDocElement = setSelectedDocElement;

        const [currentDocsPath, setCurrentDocsPath] = createSignal<string | undefined>(undefined);
        this.currentDocsPath = currentDocsPath;
        this.setCurrentDocsPath = setCurrentDocsPath;
    
        const docsDataResource = createResource(currentDocsPath, async (path) => {
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
        this.allDocs = docsResolver.allData();
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

        if (pathFromUrl !== docs.currentDocsPath()) {
            docs.setCurrentDocsPath(pathFromUrl || undefined);
        }
    };

    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    onCleanup(() => window.removeEventListener("hashchange", handleHashChange));

    createEffect(() => {
        const currentPath = docs.currentDocsPath();
        const params = getHashParams();
        const urlPath = params["docs"];

        if (currentPath !== urlPath) {
            setHashParam("docs", currentPath);
        }
    });

    return null;
};