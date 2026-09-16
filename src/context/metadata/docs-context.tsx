import { createContext, useContext, onCleanup, createEffect } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { isServer } from "solid-js/web";
import { DocsController } from "~/editor/controllers/docs-controller";
import { getHashParams, setHashParam } from "~/editor/utils/url-utils";


const DocsContext = createContext<DocsController>();
export function DocsProvider(props: { children: JSX.Element; }) {
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
