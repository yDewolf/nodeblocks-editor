import { JSXElement, JSX } from 'solid-js';

export const DocsHref = (props: {
    path: string,
    class?: string,
    onclick?: (event: MouseEvent) => void,
    children: JSX.Element,
    id?: string
    classList?: {[k: string]: boolean | undefined}
}) => {
    return (
        <a
            title={props.path}
            classList={props.classList}
            id={props.id} 
            class={"docs-href " + (props.class ?? "")} 
            href={`#docs=${props.path}`}
            onclick={props.onclick}
        >
            {props.children}
        </a>
    )
}