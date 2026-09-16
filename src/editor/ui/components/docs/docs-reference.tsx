import { JSX } from 'solid-js';
import { useDocs } from '~/context/metadata/docs-context';
import { CURRENT_PATH, DocsPathUtils, DocsRoute } from '~/helpers/docs-path-utils';

export const DocsHref = (props: {
    path?: string,
    route?: DocsRoute,    
    class?: string,
    onclick?: (event: MouseEvent) => void,
    children: JSX.Element,
    id?: string
    classList?: {[k: string]: boolean | undefined}
}) => {
    const docs = useDocs();
    if (props.route && props.route.path == CURRENT_PATH && docs.docs_path) {
        props.route.path = docs.docs_path;
    }
    return (
        <a
            title={props.path}
            classList={props.classList}
            id={props.id} 
            class={"docs-href " + (props.class ?? "")} 
            href={props.route ? `#${DocsPathUtils.buildHash(props.route)}` : `#docs=${props.path}`}
            onclick={props.onclick}
        >
            {props.children}
        </a>
    )
}