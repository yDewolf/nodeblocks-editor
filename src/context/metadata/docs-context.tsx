import { createContext, useContext, onCleanup, createEffect } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { isServer } from "solid-js/web";
import { DocsController } from "~/editor/controllers/docs-controller";
import { getHashParams, setHashParam } from "~/editor/utils/url-utils";
import { DocsPathUtils } from "~/helpers/docs-path-utils";


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
            // Usamos replaceState para não sujar o histórico se for só mudança de seção (opcional)
            window.history.pushState(null, "", `#${newHash}`);
        }
    });

    // Efeito para fazer o Scroll Automático
    createEffect(() => {
        const sectionId = docs.route?.section;
        // Esperamos o docsData carregar para garantir que os elementos já renderizaram
        if (sectionId && docs.docsData()) {
            // Pequeno delay para garantir a montagem do DOM no Solid
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                    // Opcional: Adicionar uma classe de "highlight" temporária
                    element.classList.add("highlight-section");
                    setTimeout(() => element.classList.remove("highlight-section"), 2000);
                }
            }, 50);
        }
    });

    return null;
};
