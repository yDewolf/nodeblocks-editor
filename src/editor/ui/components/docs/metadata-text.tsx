import { createMemo, JSX } from "solid-js";
import { useDocs } from "~/context/metadata/docs-context";
import { useResolvedMeta } from "~/context/metadata/metadata-context";
import { DocAnnotationHelper } from "~/helpers/anottation-helper";
import { MarkdownHelper } from "~/helpers/markdown-helper";

export const CodeTextElement = (props: { children: JSX.Element }) => {
    return <code class="code-text">{props.children}</code>;
};

export const ParsedMetaText = (props: { text: string | undefined, default?: string }) => {
    const docs = useDocs();
    const resolvedMeta = useResolvedMeta();
    const defaultText = props.default || "";

    const parsedContent = createMemo(() => {
        if (!props.text) {
            return defaultText;
        }

        const annotatedElements = DocAnnotationHelper.parse(props.text, resolvedMeta, docs.docs_path);
        return MarkdownHelper.parse(annotatedElements);
    });

    return <p class="parsed-meta-text">{parsedContent()}</p>;
};