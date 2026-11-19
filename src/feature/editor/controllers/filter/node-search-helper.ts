import { MetadataStoreData } from "~/feature/metadata/metadata_controller";
import { NamespaceUtils } from "~/protocols/nodeblocks/namespace-model";
import { escapeRegex } from "~/utils/regex-utils";

export interface NodeTypeSearch {
    id: string;
    package_id: string;

    capitalized_name: string;
    description?: string;
    brief?: string;
    fqn: string;
}

export class NodeSearchHelper {
    public static get_node_topics(metadataStore: Record<string, MetadataStoreData>): NodeTypeSearch[] {
        const topics: NodeTypeSearch[] = [];
        Object.entries(metadataStore).forEach(([package_id, metadata]) => {
            if (metadata.node_types) {
                Object.entries(metadata.node_types).forEach(([id, node_meta]) => {
                    const fqn = NamespaceUtils.makeFqn(package_id, id);
                    topics.push({
                        id,
                        package_id: package_id,
                        capitalized_name: node_meta.capitalized_name || id,
                        description: node_meta.description,
                        brief: node_meta.brief,
                        fqn: fqn
                    });
                });
            }
        });
        return topics;
    }

    public static search_node(topics: NodeTypeSearch[], query: string): NodeTypeSearch[] {
        const trimmed = query.trim();
        if (!trimmed) return [];

        const regex = new RegExp(escapeRegex(trimmed), 'i');

        return topics.filter(topic => 
            regex.test(topic.capitalized_name) || 
            regex.test(topic.id) || 
            (topic.description && regex.test(topic.description)) || 
            (topic.brief && regex.test(topic.brief))
        );
    }
}
