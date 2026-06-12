import { createSignal, createResource, Resource, JSX, createContext, useContext } from "solid-js";
import { docsResolver } from "~/singletons/docs";
import { isServer } from "solid-js/web";
import { DocPayload } from "~/network/controllers/docs/docs-interfaces";

export class DocsController {
    public hoveredDocElement: () => HTMLElement | null;
    public setHoveredDocElement: (element: HTMLElement | null) => void;

    public selectedDocElement: () => HTMLElement | null;
    public setSelectedDocElement: (element: HTMLElement | null) => void;

    public currentDocsPath: () => string | undefined;
    public setCurrentDocsPath: (path: string | undefined) => void;

    public docsData: Resource<DocPayload | undefined>;

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
            const data = await docsResolver.resolve(path);
            return data;
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