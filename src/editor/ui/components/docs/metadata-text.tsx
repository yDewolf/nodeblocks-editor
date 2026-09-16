import { createMemo } from "solid-js";
import { useResolvedMeta } from "~/context/metadata/metadata-context";
import { DocAnnotationHelper } from "~/helpers/anottation-helper";

export const ParsedMetaText = (props: { text: string | undefined, default?: string}) => {
    const resolvedMeta = useResolvedMeta();
    const defaultText = props.default || "";
    console.log(resolvedMeta);

    const parsedContent = createMemo(() => {
        if (props.text == "") {
            return defaultText;
        }
        return DocAnnotationHelper.parse(props.text, resolvedMeta);
    });

    return <p class="parsed-meta-text">{parsedContent()}</p>;
};