import { ParentComponent, createContext, createMemo, useContext } from 'solid-js';
import { NodeFilterController } from "../controllers/filter/node-filter-controller";
import { NodeSearchHelper, NodeTypeSearch } from '../controllers/filter/node-search-helper';
import { NodeTypeSpec } from '~/protocols/nodeblocks/manifests/node/node-spec';
import { useMetadata } from '~/feature/metadata/metadata-context';
import { usePackageManager } from './package-manager-context';

interface NodeFilterContextValue {
    filterController: NodeFilterController
    nodeTopics: NodeTypeSearch[]
    searchSpec: (query: string) => NodeTypeSpec[]
    searchNode: (query: string) => NodeTypeSearch[]
}

const NodeFilterContext = createContext<NodeFilterContextValue>();
export const NodeFilterProvider: ParentComponent<{
    controller: NodeFilterController
}> = (props) => {
    const metadata = useMetadata();
    const packageManager = usePackageManager();
    const topics = createMemo(() => {
        if (metadata) {
            return NodeSearchHelper.get_node_topics(metadata.store);
        }
        return [];
    });

    const handleSearch = (query: string): NodeTypeSearch[] => {
        return NodeSearchHelper.search_node(topics(), query);
    }

    const handleSearchSpec = (query: string): NodeTypeSpec[] => {
        const nodeTopics = handleSearch(query);
        let nodeSpecs: NodeTypeSpec[] = [];
        for (const topic of nodeTopics) {
            try {
                const spec = packageManager.registry.getNodeTypeSpec(topic.fqn);
                nodeSpecs.push(spec);
            } catch (err) {
                console.error("Failed to grab spec from node topic: ", err);
            }
        }
        return nodeSpecs;
    }

    return (
        <NodeFilterContext.Provider value={{
            filterController: props.controller,
            nodeTopics: topics(),
            searchSpec: handleSearchSpec,
            searchNode: handleSearch
        }}>
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
