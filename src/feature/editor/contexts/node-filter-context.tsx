import { ParentComponent, createContext, useContext } from 'solid-js';
import { NodeFilterController } from "../controllers/filter/node-filter-controller";

const NodeFilterContext = createContext<NodeFilterController>();
export const NodeFilterProvider: ParentComponent<{
    controller: NodeFilterController
}> = (props) => {
    return (
        <NodeFilterContext.Provider value={props.controller}>
            {props.children}
        </NodeFilterContext.Provider>
    )
}

export const ensureNodeFilters = () => {
    const context = useContext(NodeFilterContext);
    if (!context) {
        throw Error("ensureNodeFilters must be used inside a NodeFilterProvider")
    }
    return context;
}
