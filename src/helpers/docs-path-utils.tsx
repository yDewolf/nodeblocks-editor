import { DocsPathPrefix } from "~/network/controllers/docs/docs-interfaces";
import { DocsPathSplitter } from "~/singletons/metadata";
import { BaseDataType } from "~/wrapper/nodes/data/node-data-type";
import { GraphNode } from "~/wrapper/nodes/graph-node";
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot";

export const CURRENT_PATH = "{current}";
export interface DocsRoute {
    path: string;
    section?: string;
}
export class DocsPathUtils {
    static buildHash(route: DocsRoute): string {
        const params = new URLSearchParams();
        params.set("docs", route.path);
        if (route.section) {
            params.set("section", route.section);
        }
        return params.toString();
    }

    /**
     * Interprets a given hash as a DocsRoute
     */
    static parseHash(hashString: string): DocsRoute | undefined {
        const cleanHash = hashString.startsWith("#") ? hashString.slice(1) : hashString;
        if (!cleanHash) return undefined;

        const params = new URLSearchParams(cleanHash);
        const path = params.get("docs");

        if (!path) return undefined;

        return {
            path: path,
            section: params.get("section") || undefined
        };
    }
    /**
     * Creates a path to a Node's documentation page.
     */
    public static makeNodePath(root_id: string, node?: GraphNode, type_id?: string): string {
        const targetId = node ? node.type_id : type_id;
        return `${root_id}${DocsPathSplitter}${DocsPathPrefix.NODE}${DocsPathSplitter}${targetId}`;
    }

    /**
     * Creates a path to a DataType's documentation page.
     */
    public static makeDataTypePath(
        root_id: string, 
        datatype?: BaseDataType, 
        slot?: NodeSlot, 
        type_id?: string
    ): string {
        if (datatype) {
            return `${root_id}${DocsPathSplitter}${DocsPathPrefix.DATATYPE}${DocsPathSplitter}${datatype.type_id}`;
        }

        if (slot) {
            return `${root_id}${DocsPathSplitter}${DocsPathPrefix.DATATYPE}${DocsPathSplitter}${slot.data_type.type_id}`;
        }

        if (type_id) {
            return `${root_id}${DocsPathSplitter}${DocsPathPrefix.DATATYPE}${DocsPathSplitter}${type_id}`;
        }

        return root_id;
    }

    /**
     * Creates a path to a UI Element's documentation page.
     */
    public static makeUIPath(root_id: string, docs_element_id: string): string {
        return `${root_id}${DocsPathSplitter}${DocsPathPrefix.UI}${DocsPathSplitter}${docs_element_id}`;
    }

    public static makeAutoPath(root_id: string, docs_prefix: DocsPathPrefix, id: string) {
        switch (docs_prefix) {
            case DocsPathPrefix.NODE: return this.makeNodePath(root_id, undefined, id);
            case DocsPathPrefix.DATATYPE: return this.makeDataTypePath(root_id, undefined, undefined, id);
            case DocsPathPrefix.UI: return this.makeUIPath(root_id, id);
            case DocsPathPrefix.HEADER: return root_id;
        }
    }

    /**
     * Parses a path string and returns its components.
     */
    public static parsePath(path: string, default_root: string): { rootId: string; docType?: DocsPathPrefix; targetId?: string } {
        if (!path) {
            return { rootId: "" };
        }

        const parts = path.split(DocsPathSplitter);
        if (parts.length == 1) {
            return {
                rootId: default_root,
                targetId: path
            }
        }
        if (parts.length == 2) {
            return {
                rootId: default_root,
                docType: parts[0] as DocsPathPrefix | undefined,
                targetId: parts[1] || undefined
            }
        }
        return {
            rootId: parts[0] || "",
            docType: parts[1] as DocsPathPrefix | undefined,
            targetId: parts[2] || undefined
        };
    }

    /**
     * Extracts root id from a path.
     */
    public static extractRootId(path: string): string {
        // Maybe FIXME (limit = 3)
        return path.split(DocsPathSplitter, 3)[0] || "";
    }

    /**
     * Extracts the final id from a path.
     */
    public static extractTargetId(path: string): string | undefined {
        // Maybe FIXME (limit = 3)
        const parts = path.split(DocsPathSplitter, 3);
        return parts.length >= 3 ? parts[2] : undefined;
    }

    /**
     * Checks if a path is of a specific type.
     */
    public static isType(path: string, prefix: DocsPathPrefix): boolean {
        const parsed = this.parsePath(path, "");
        return parsed.docType === prefix;
    }
}