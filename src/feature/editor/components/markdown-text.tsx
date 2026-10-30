import { createMemo } from "solid-js";
import { MarkdownHelper } from "~/helpers/markdown-helper";

export const MarkdownText = (props: {
    text: string
}) => {
    const parsedContent = createMemo(() => {
        return MarkdownHelper.parse(props.text);
    });


    return (
        <p class="markdown-text">
            {parsedContent()}
        </p>
    )
}