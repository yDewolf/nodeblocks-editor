import { createMemo } from "solid-js";
import { useDocs } from "~/context/metadata/docs-context";
import { useResolvedMeta } from "~/context/metadata/metadata-context";
import { DocAnnotationHelper } from "~/helpers/anottation-helper";

export const ParsedMetaText = (props: { text: string | undefined, default?: string}) => {
    const docs = useDocs();
    const resolvedMeta = useResolvedMeta();
    const defaultText = props.default || "";

    const parsedContent = createMemo(() => {
        if (props.text == "") {
            return defaultText;
        }
        return DocAnnotationHelper.parse(props.text, resolvedMeta, docs.docs_path);
    });

    return <p class="parsed-meta-text">{parsedContent()}</p>;
};