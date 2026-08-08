import { MetadataController, MetadataStoreData } from "../metadata/metadata_controller";
import { make_datatype_docs_path, make_node_docs_path, make_ui_docs_path } from "./docs-resolver";

export type DocTopicType = 'node' | 'datatype' | 'interface' | "header";
export interface DocTopic {
    id: string;
    root_id: string;
    type: DocTopicType;
    capitalized_name: string;
    description?: string;
    path: string;
}

function escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class DocSearchHelper {
    // private metadata_controller: MetadataController;
    // protected doc_topics: DocTopic[] | undefined = undefined;
    
    // public constructor(metadata_controller: MetadataController) {
    //     this.metadata_controller = metadata_controller;

    //     const topics = this.get_doc_topics(this.metadata_controller.store);
    //     this.doc_topics = topics;
    // }

    public static get_doc_topics(store: Record<string, MetadataStoreData>): DocTopic[] {
        const topics: DocTopic[] = [];
        Object.entries(store).forEach(([root_id, metaData]) => {
            if (metaData.node_types) {
                Object.entries(metaData.node_types).forEach(([id, node_meta]) => {
                    topics.push({
                        id,
                        root_id: root_id,
                        type: 'node',
                        capitalized_name: node_meta.capitalized_name || id,
                        description: node_meta.description,
                        path: make_node_docs_path(root_id, undefined, id)
                    });
                });
            }

            if (metaData.data_types) {
                Object.entries(metaData.data_types).forEach(([id, datatype_meta]) => {
                    topics.push({
                        id,
                        root_id: root_id,
                        type: 'datatype',
                        capitalized_name: datatype_meta.capitalized_name || id,
                        description: datatype_meta.description,
                        path: make_datatype_docs_path(root_id, undefined, undefined, id)
                    });
                });
            }

            if (metaData.interface) {
                Object.entries(metaData.interface).forEach(([id, iface_meta]) => {
                    topics.push({
                        id,
                        root_id: root_id,
                        type: 'interface',
                        capitalized_name: iface_meta.capitalized_name || id,
                        description: iface_meta.description,
                        path: make_ui_docs_path(root_id, id)
                    });
                });
            }

            if (metaData.header) {
                topics.push({
                    id: root_id,
                    root_id: root_id,
                    type: 'header',
                    capitalized_name: metaData.header.capitalized_name || root_id,
                    description: metaData.header.description,
                    path: root_id
                });
            }
        });

        return topics;
    }

    public static search_topic(topics: DocTopic[], query: string): DocTopic[] {
        const trimmed = query.trim();
        if (!trimmed) return [];

        const regex = new RegExp(escapeRegex(trimmed), 'i');

        return topics.filter(topic => 
            regex.test(topic.capitalized_name) || 
            regex.test(topic.id) || 
            (topic.description && regex.test(topic.description))
        );
    }
}
