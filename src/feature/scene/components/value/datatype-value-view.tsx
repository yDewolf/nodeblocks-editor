import { Show, Switch, Match } from "solid-js";
import { DefaultRenderers } from "~/protocols/nodeblocks/manifests/node/datatype-enums";
import { DefaultDataTypes } from "~/protocols/nodeblocks/manifests/node/datatype-enums";
import { ArrayView } from "./array-view";
import { ScalarView } from "./scalar-view";
import { MarkdownText } from "~/feature/editor/components/markdown-text";
import { DataTypeValueMeta } from "~/protocols/nodeblocks/manifests/node/datatype-value-meta";
import { ArtifactView } from './artifact-view';


export interface DataTypeValuePack {
    renderer: DefaultRenderers;
    base_type: DefaultDataTypes;
    font_id: string;

    value_meta?: DataTypeValueMeta
    value: any;
}

export const DataTypeValueSelector = (props: { value?: DataTypeValuePack; }) => {
    return (
        <Show when={props.value} fallback={<span class="none">No Value</span>}>
            {(output) => <Show when={props.value?.value != undefined} fallback={<span class="none">No Value</span>}>
                <Switch>
                    <Match when={output().renderer === DefaultRenderers.SCALAR}>
                        <ScalarView output_value={props.value} />
                    </Match>

                    <Match when={output().renderer === DefaultRenderers.ARRAY}>
                        <ArrayView output_value={props.value} />
                    </Match>
                    <Match when={output().renderer === DefaultRenderers.TEXT}>
                        <MarkdownText text={JSON.stringify(props.value?.value)}/>
                        {/* <div class="custom-view">
                            JSON: {JSON.stringify(props.value?.value)}
                        </div> */}
                    </Match>
                    <Match when={output().renderer === DefaultRenderers.FILE}>
                        <ArtifactView artifact_name={props.value?.value} root_id={props.value?.font_id}/>
                    </Match>
                    <Match when={output().renderer === DefaultRenderers.NOT_IMPLEMENTED}>
                        <span>Can't render Unknown Type</span>
                    </Match>
                </Switch>
            </Show>}
        </Show>
    );
};

