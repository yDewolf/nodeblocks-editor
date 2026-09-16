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

            elements.push(this.resolveAnnotation(annotation, label, resolvedMeta, super_path));
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
        const split = annotation_str.slice(1).split(":");
        const annotation_type = split[0];
        const annotation_target = split.slice(1).join(":");

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
                        section: `slot-${annotation_target}`
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
                        section: `param-${annotation_target}`
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

        console.log(`${annotation_str} -> ${finalRoute}`);
        console.debug(super_path, annotation_type, annotation_target);
        return (
            <DocsHref class="text-reference" route={finalRoute} children={displayLabel}/>
        );
    }
}