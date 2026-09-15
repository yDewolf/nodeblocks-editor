import { JSX } from "solid-js";
import { MetadataHeader, Metadata } from "~/wrapper/metadata/header_metadata";
import { NodeTypeMeta, DataTypeMeta } from "~/wrapper/metadata/type_metadata";
import { InterfaceElementMeta } from "./docs-interfaces";
import { DocsHref } from "~/editor/ui/components/docs/docs-reference";

export type ParseContext = 
    | NodeTypeMeta 
    | InterfaceElementMeta 
    | DataTypeMeta 
    | MetadataHeader;

export class DocAnnotationHelper {
    public static parseGeneric(
        text: string | undefined | null, 
        context: ParseContext | undefined, 
        globalMeta?: Metadata
    ): JSX.Element {
        if (!text) return null;
        if (!context) {
            return text;
        }

        // Regex para capturar no formato [Label](@tipo:id)
        const labelCaptureRegex = /\[([^\]]+)\]\((@[^)]+)\)/g;
        
        const elements: JSX.Element[] = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = labelCaptureRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                elements.push(text.substring(lastIndex, match.index));
            }

            const label = match[1];
            const annotation = match[2];

            elements.push(this.resolveAnnotation(annotation, label, context, globalMeta));
            lastIndex = labelCaptureRegex.lastIndex;
        }

        if (lastIndex < text.length) {
            elements.push(text.substring(lastIndex));
        }

        return elements;
    }

    private static resolveAnnotation(
        annotation: string, 
        label: string, 
        context: ParseContext,
        globalMeta?: Metadata
    ): JSX.Element {
        const withoutAt = annotation.slice(1);
        const [type, id] = withoutAt.split(":");

        let resolvedName = label;
        let targetPath = annotation; 

        if (type === "slot") {
            if ("slot_meta" in context && context.slot_meta[id]) {
                const slot = context.slot_meta[id];
                targetPath = `slots.${id}`; 
            }
        } 

        else if (type === "params") {
            if ("parameter_meta" in context && context.parameter_meta[id]) {
                const param = context.parameter_meta[id];
                targetPath = `params.${id}`;
            }
        }

        return (
            <DocsHref
                class="text-reference"
                path={targetPath}
                children={resolvedName}
            />
        );
    }
}