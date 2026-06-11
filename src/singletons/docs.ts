import { DocsResolver } from "~/network/controllers/docs/docs-resolver";
import { createResource, createSignal } from "solid-js";
import { DocPayload } from "~/network/controllers/docs/docs-interfaces";

const resolver = new DocsResolver();

export const [currentDocsPath, setCurrentDocsPath] = createSignal<string | undefined>(undefined);
export const [docData] = createResource(currentDocsPath, async (path) => {
    if (!path) return undefined;
    const data = await resolver.resolve(path);
    return data;
});