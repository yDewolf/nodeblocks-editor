import { JSX } from "solid-js";
import { MetadataHeader } from "~/wrapper/metadata/header_metadata";
import { NodeTypeMeta, DataTypeMeta } from "~/wrapper/metadata/type_metadata";
import {  InterfaceElementMeta } from "../network/controllers/docs/docs-interfaces";
import { useResolvedMeta } from "~/context/metadata/metadata-context";
import { DocsHref } from "~/editor/ui/components/docs/docs-reference";
import { CURRENT_PATH, DocsPathUtils, DocsRoute } from "./docs-path-utils";

export type ResolvedMeta = ReturnType<typeof useResolvedMeta>;

export type ParseContext = 
    | NodeTypeMeta 
    | InterfaceElementMeta 
    | DataTypeMeta 
    | MetadataHeader;

export class DocAnnotationHelper {
    static parse(
        text: string | undefined | null,
        resolvedMeta: ResolvedMeta,
        super_path?: string
    ): JSX.Element {
        if (!text) return null;

        // regex feito pelo gemini
        const regex = /\[([^\]]+)\]\((@[a-zA-Z_]\w*:[^\s)]+)\)|(@[a-zA-Z_]\w*:[a-zA-Z0-9_]+(?:[:\.-][a-zA-Z0-9_]+)*)/g;

        const elements: JSX.Element[] = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                elements.push(text.substring(lastIndex, match.index));
            }

            const label = match[1] ?? "auto";
            const annotation = match[2] ?? match[3];

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
        resolvedMeta: ResolvedMeta,
        super_path?: string
    ): JSX.Element {
        const cleanStr = annotation_str.startsWith("@") ? annotation_str.slice(1) : annotation_str;
        const firstColonIndex = cleanStr.indexOf(":");

        if (firstColonIndex === -1) {
            return annotation_str;
        }

        const annotation_type = cleanStr.slice(0, firstColonIndex);
        const annotation_target = cleanStr.slice(firstColonIndex + 1);

        super_path = super_path || CURRENT_PATH
        
        const rootMeta = resolvedMeta.rootMeta?.metadata;
        const nodeMeta = resolvedMeta.nodeMeta?.node_meta;
        const dataTypeMeta = resolvedMeta.dataTypeMeta?.datatype_meta;

        const currentTypesId = rootMeta?.header?.types_id || "";
        const defaultRoot = currentTypesId;

        let displayLabel = label;
        let finalRoute: DocsRoute | undefined = undefined;
        switch (annotation_type) {
            // --- Referências de Slot do Nó Atual ---
            case "slot": {
                if (nodeMeta) {
                    const slot = nodeMeta.slot_meta?.[annotation_target];
                    if (slot && label === "auto") {
                        displayLabel = slot.capitalized_name;
                    }
                    finalRoute = {
                        path: super_path,
                        section: DocsPathUtils.makeSlotSectionId(annotation_target)
                    }
                }
                break;
            }

            // --- Referências de Parâmetro do Nó Atual ---
            case "params": {
                if (nodeMeta) {
                    const param = nodeMeta.parameter_meta?.[annotation_target];
                    if (param && label === "auto") {
                        displayLabel = param.capitalized_name;
                    }
                    finalRoute = {
                        path: super_path,
                        section: DocsPathUtils.makeParamSectionId(annotation_target)
                    }
                }
                break;
            }

            // --- Referências Globais a Outros Nós ---
            case "node": {
                // Suporta "@node:target_id" (mesmo root) ou "@node:other_root.target_id"
                const {rootId, docType, targetId} = DocsPathUtils.parsePath(annotation_target, defaultRoot)
                if (!targetId) { break; }
                if (rootMeta && rootId === currentTypesId) {
                    const targetNode = rootMeta.node_types?.[targetId];
                    if (targetNode && label === "auto") {
                        displayLabel = targetNode.capitalized_name;
                    }
                }
                finalRoute = { path: DocsPathUtils.makeNodePath(rootId, undefined, targetId) }
                break;
            }

            // --- Referências Globais a Data Types ---
            case "datatype": {
                const {rootId, docType, targetId} = DocsPathUtils.parsePath(annotation_target, defaultRoot)
                if (!targetId) { break; }
                if (rootMeta && rootId === currentTypesId) {
                    const targetType = rootMeta.data_types?.[targetId];
                    if (targetType && label === "auto") {
                        displayLabel = targetType.capitalized_name;
                    }
                }

                finalRoute = { path: DocsPathUtils.makeDataTypePath(rootId, undefined, undefined, targetId) }
                break;
            }

            default: {
                finalRoute = { path: annotation_target }
                break;
            }
        }

        console.debug(`${annotation_str} -> ${finalRoute}`);
        return (
            <DocsHref class="text-reference" route={finalRoute} children={displayLabel}/>
        );
    }
}