import { createContext, useContext, onCleanup, createEffect } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { isServer } from "solid-js/web";
import { DocsPathUtils } from "~/feature/docs/helpers/docs-path-utils";
import { DocsController } from "./docs-controller";
import { useLocation, useNavigate } from "@solidjs/router";

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
    const location = useLocation();
    const navigate = useNavigate();

    createEffect(() => {
        const hash = location.hash.slice(1);
        const route = DocsPathUtils.parseHash(hash);

        if (route?.path !== docs.route?.path || route?.section !== docs.route?.section) {
            docs.setRoute(route);
        }
    });

    createEffect(() => {
        const currentRoute = docs.route;
        
        if (!currentRoute) {
            if (location.hash) {
                navigate(".", { replace: true, scroll: false });
            }
            return;
        }

        const newHash = DocsPathUtils.buildHash(currentRoute);
        const currentHash = location.hash.slice(1);

        // if (newHash !== currentHash) {
        //     navigate(`#${newHash}`, { replace: false, scroll: false });
        // }
    });

    return null;
};
