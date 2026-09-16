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

// TODO: melhorar o jeito que isso aqui fica no meio do texto. Talvez funcionar como um popup (?) ou um dropdown
export const YouTubeEmbed = (props: { videoId: string; title?: string }) => {
    return (
        <div class="embed-wrapper youtube-embed container">
            <h4 class="embed-title">
                {props.title}
            </h4>
            <iframe 
                class="embed-frame"
                src={`https://www.youtube.com/embed/${props.videoId}`}
                title={props.title || "YouTube video player"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
            />
        </div>
    );
};
