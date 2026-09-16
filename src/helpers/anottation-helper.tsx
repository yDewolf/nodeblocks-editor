import { JSX } from "solid-js";
import { MetadataHeader } from "~/wrapper/metadata/header_metadata";
import { NodeTypeMeta, DataTypeMeta } from "~/wrapper/metadata/type_metadata";
import { DocsPathPrefix, InterfaceElementMeta } from "../network/controllers/docs/docs-interfaces";
import { useResolvedMeta } from "~/context/metadata/metadata-context";
import { DocsHref } from "~/editor/ui/components/docs/docs-reference";
import { make_node_docs_path } from "~/network/controllers/docs/docs-resolver";
import { DocsPathUtils } from "./docs-path-utils";

export type ResolvedMeta = ReturnType<typeof useResolvedMeta>;

export type ParseContext = 
    | NodeTypeMeta 
    | InterfaceElementMeta 
    | DataTypeMeta 
    | MetadataHeader;

export class DocAnnotationHelper {
    static parse(
        text: string | undefined | null,
        resolvedMeta: ResolvedMeta
    ): JSX.Element {
        if (!text) return null;

        const regex = /\[([^\]]+)\]\((@[^)]+)\)/g;
        const elements: JSX.Element[] = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                elements.push(text.substring(lastIndex, match.index));
            }

            const label = match[1];
            const annotation = match[2];

            elements.push(this.resolveAnnotation(annotation, label, resolvedMeta));
            lastIndex = regex.lastIndex;
        }

        if (lastIndex < text.length) {
            elements.push(text.substring(lastIndex));
        }

        return elements;
    }

    private static resolveAnnotation(
        annotation_str: string,
        label: string,
        resolvedMeta: ResolvedMeta
    ): JSX.Element {
        const [annotation_type, target_id] = annotation_str.slice(1).split(":");
        console.log(annotation_str, annotation_type, target_id);
        
        const rootMeta = resolvedMeta.rootMeta?.metadata;
        const nodeMeta = resolvedMeta.nodeMeta?.node_meta;
        const dataTypeMeta = resolvedMeta.dataTypeMeta?.datatype_meta;

        const currentTypesId = rootMeta?.header?.types_id || "";
        let targetPath = "";
        let displayLabel = label;

        switch (annotation_type) {
            // --- Referências de Slot do Nó Atual ---
            case "slot": {
                if (nodeMeta) {
                    const slot = nodeMeta.slot_meta?.[target_id];
                    if (slot && label === "auto") {
                        displayLabel = slot.capitalized_name;
                    }
                    targetPath = `slot-${target_id}`; // Scroll relativo no nó atual
                }
                break;
            }

            // --- Referências de Parâmetro do Nó Atual ---
            case "params": {
                if (nodeMeta) {
                    const param = nodeMeta.parameter_meta?.[target_id];
                    if (param && label === "auto") {
                        displayLabel = param.capitalized_name;
                    }
                    targetPath = `param-${target_id}`; // Scroll relativo no nó atual
                }
                break;
            }

            // --- Referências Globais a Outros Nós ---
            case "node": {
                // Suporta "@node:target_id" (mesmo root) ou "@node:other_root.target_id"
                const {rootId, docType, targetId} = DocsPathUtils.parsePath(target_id)
                if (!targetId) { break; }
                if (rootMeta && rootId === currentTypesId) {
                    const targetNode = rootMeta.node_types?.[targetId];
                    if (targetNode && label === "auto") {
                        displayLabel = targetNode.capitalized_name;
                    }
                }

                targetPath = DocsPathUtils.makeNodePath(rootId, undefined, targetId);
                break;
            }

            // --- Referências Globais a Data Types ---
            case "datatype": {
                const {rootId, docType, targetId} = DocsPathUtils.parsePath(target_id)
                if (!targetId) { break; }
                if (rootMeta && rootId === currentTypesId) {
                    const targetType = rootMeta.data_types?.[targetId];
                    if (targetType && label === "auto") {
                        displayLabel = targetType.capitalized_name;
                    }
                }

                targetPath = DocsPathUtils.makeDataTypePath(rootId, undefined, undefined, targetId);
                break;
            }

            default: {
                targetPath = `${target_id}`;
                break;
            }
        }

        return (
            <DocsHref class="text-reference" path={targetPath} children={displayLabel}/>
        );
    }
}