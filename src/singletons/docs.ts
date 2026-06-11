import { DocsResolver } from "~/network/controllers/docs/docs-resolver";
import { createResource, createSignal } from "solid-js";

const resolver = new DocsResolver();

const [hoveredDocElement, setHoveredDocElement] = createSignal<HTMLElement | null>(null);
const [selectedDocElement, setSelectedDoctElement] = createSignal<HTMLElement | null>(null);
export { hoveredDocElement, setHoveredDocElement, selectedDocElement, setSelectedDoctElement as setSelectedDocElement };

export const [currentDocsPath, setCurrentDocsPath] = createSignal<string | undefined>(undefined);
export const [docData] = createResource(currentDocsPath, async (path) => {
    if (!path) return undefined;
    const data = await resolver.resolve(path);
    return data;
});