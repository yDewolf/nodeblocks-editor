import { createContext, useContext, onCleanup, createEffect } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { isServer } from "solid-js/web";
import { DocsPathUtils } from "~/feature/docs/helpers/docs-path-utils";
import { DocsController } from "./docs-controller";

const DocsContext = createContext<DocsController>();
export function DocsProvider(props: { controller: DocsController, children: JSX.Element; }) {
    return (
        <DocsContext.Provider value={props.controller}>
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
        const route = DocsPathUtils.parseHash(window.location.hash);
        if (route?.path !== docs.route?.path || route?.section !== docs.route?.section) {
            docs.setRoute(route);
        }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    onCleanup(() => window.removeEventListener("hashchange", handleHashChange));

    createEffect(() => {
        const currentRoute = docs.route;
        if (!currentRoute) {
            window.location.hash = "";
            return;
        }

        const newHash = DocsPathUtils.buildHash(currentRoute);
        const currentHash = window.location.hash.slice(1);

        if (newHash !== currentHash) {
            window.history.pushState(null, "", `#${newHash}`);
        }
    });

    return null;
};
