import { JSX } from "solid-js/jsx-runtime";
import { CodeTextElement, YouTubeEmbed } from "~/editor/ui/components/docs/metadata-text";

export function extractYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
}


// Obrigado Google Gemini por me ajudar a fazer isso aqui !!
export class MarkdownHelper {
    static parse(content: string | JSX.Element | (string | JSX.Element)[]): JSX.Element[] {
        if (Array.isArray(content)) {
            return content.flatMap((item) => this.parseItem(item));
        }
        return this.parseItem(content);
    }

    private static parseItem(item: string | JSX.Element): JSX.Element[] {
        if (typeof item !== "string") {
            return [item];
        }
        // Inicia a cadeia pelos Embeds/Mídia
        return this.parseEmbeds(item);
    }

    private static parseEmbeds(text: string): JSX.Element[] {
        const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;

        return this.splitAndParse(
            text,
            regex,
            (match) => {
                const label = match[1];
                const url = match[2].trim();
                const ytId = extractYouTubeId(url);

                if (ytId) {
                    return <YouTubeEmbed videoId={ytId} title={label} />;
                }

                return <img src={url} alt={label} class="docs-image" />;
            },
            this.parseLinks.bind(this)
        );
    }

    private static parseLinks(text: string): JSX.Element[] {
        const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
        return this.splitAndParse(
            text,
            regex,
            (match) => {
                const label = match[1];
                const url = match[2].trim();

                const parsedLabel = this.parseCode(label);
                const isExternal = /^https?:\/\//i.test(url);

                return (
                    <a
                        href={url}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        class="docs-link"
                    >
                        {parsedLabel}
                    </a>
                );
            },
            this.parseCode.bind(this)
        );
    }

    private static parseCode(text: string): JSX.Element[] {
        const regex = /`([^`]+)`/g;
        return this.splitAndParse(
            text,
            regex,
            (match) => <CodeTextElement>{match[1]}</CodeTextElement>,
            this.parseBold.bind(this)
        );
    }

    private static parseBold(text: string): JSX.Element[] {
        const regex = /\*([^\s*](?:[^*]*[^\s*])?)\*/g;
        return this.splitAndParse(
            text,
            regex,
            (match) => <b>{this.parseItalics(match[1])}</b>,
            this.parseItalics.bind(this)
        );
    }

    private static parseItalics(text: string): JSX.Element[] {
        const regex = /\b_([^\s_](?:[^_]*[^\s_])?)_\b/g;
        return this.splitAndParse(
            text,
            regex,
            (match) => <i>{match[1]}</i>,
            (str) => [str]
        );
    }

    private static splitAndParse(
        text: string,
        regex: RegExp,
        replacer: (match: RegExpExecArray) => JSX.Element,
        nextParser: (text: string) => JSX.Element[]
    ): JSX.Element[] {
        const elements: JSX.Element[] = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                elements.push(...nextParser(text.substring(lastIndex, match.index)));
            }

            elements.push(replacer(match));
            lastIndex = regex.lastIndex;
        }

        if (lastIndex < text.length) {
            elements.push(...nextParser(text.substring(lastIndex)));
        }

        return elements;
    }
}