import { JSX } from "solid-js/jsx-runtime";
import { CodeTextElement } from "~/editor/ui/components/docs/metadata-text";

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
        return this.parseCode(item);
    }

    // --- 1. Processa blocos de código `texto` ---
    private static parseCode(text: string): JSX.Element[] {
        const regex = /`([^`]+)`/g;
        return this.splitAndParse(
            text,
            regex,
            (match) => <CodeTextElement>{match[1]}</CodeTextElement>,
            this.parseBold.bind(this)
        );
    }

    // --- 2. Processa Negrito *texto* ---
    private static parseBold(text: string): JSX.Element[] {
        // Explicação da Regex:
        // \*         -> Asterisco de abertura
        // (          -> Início da captura
        //   [^\s*]   -> O PRIMEIRO caractere não pode ser espaço nem asterisco
        //   (?:      -> Grupo opcional do "meio" do texto
        //     [^*]*  -> Qualquer quantidade de caracteres que não sejam asteriscos
        //     [^\s*] -> O ÚLTIMO caractere também não pode ser espaço nem asterisco
        //   )?       -> Faz o grupo do meio ser opcional (para aceitar palavras de 1 letra ex: *a*)
        // )          -> Fim da captura
        // \*         -> Asterisco de fechamento
        const regex = /\*([^\s*](?:[^*]*[^\s*])?)\*/g;
        
        return this.splitAndParse(
            text,
            regex,
            (match) => <b>{this.parseItalics(match[1])}</b>,
            this.parseItalics.bind(this)
        );
    }

    // --- 3. Processa Itálico _texto_ ---
    private static parseItalics(text: string): JSX.Element[] {
        // Mesma lógica de validação de espaço do negrito, mas com um "bônus":
        // O \b (Word Boundary) garante que o "_" não está no meio de uma palavra (snake_case)
        // Isso impede que "tensor_0 * weight_0" transforme "0 * weight" em itálico.
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