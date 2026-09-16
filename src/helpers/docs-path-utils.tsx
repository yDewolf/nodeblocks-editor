import { DocsPathPrefix } from "~/network/controllers/docs/docs-interfaces";
import { DocsPathSplitter } from "~/singletons/metadata";
import { BaseDataType } from "~/wrapper/nodes/data/node-data-type";
import { GraphNode } from "~/wrapper/nodes/graph-node";
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot";

export class DocsPathUtils {
    /**
     * Cria o caminho de documentação para um nó.
     */
    static makeNodePath(root_id: string, node?: GraphNode, type_id?: string): string {
        const targetId = node ? node.type_id : type_id;
        return `${root_id}${DocsPathSplitter}${DocsPathPrefix.NODE}${DocsPathSplitter}${targetId}`;
    }

    /**
     * Cria o caminho de documentação para um tipo de dado (datatype).
     */
    static makeDataTypePath(
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
     * Cria o caminho de documentação para um elemento de interface de usuário.
     */
    static makeUIPath(root_id: string, docs_element_id: string): string {
        return `${root_id}${DocsPathSplitter}${DocsPathPrefix.UI}${DocsPathSplitter}${docs_element_id}`;
    }

    /**
     * Faz o parse de uma string de caminho para extrair seus componentes.
     */
    static parsePath(path: string): { rootId: string; docType?: DocsPathPrefix; targetId?: string } {
        if (!path) {
            return { rootId: "" };
        }

        const parts = path.split(DocsPathSplitter);

        return {
            rootId: parts[0] || "",
            docType: parts[1] as DocsPathPrefix | undefined,
            targetId: parts[2] || undefined
        };
    }

    /**
     * Extrai apenas o rootId de um caminho completo.
     */
    static extractRootId(path: string): string {
        return path.split(DocsPathSplitter)[0] || "";
    }

    /**
     * Extrai o targetId (id do nó, datatype ou elemento de UI) de um caminho completo.
     */
    static extractTargetId(path: string): string | undefined {
        const parts = path.split(DocsPathSplitter);
        return parts.length >= 3 ? parts[2] : undefined;
    }

    /**
     * Verifica se o caminho pertence a um tipo de prefixo específico.
     */
    static isType(path: string, prefix: DocsPathPrefix): boolean {
        const parsed = this.parsePath(path);
        return parsed.docType === prefix;
    }
}