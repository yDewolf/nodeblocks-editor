import { Show, Switch, Match } from "solid-js";
import { DefaultRenderers, DefaultDataTypes } from "~/old/wrapper/nodes/data/node-data-type";
import { ArrayView } from "./array-view";
import { ScalarView } from "./scalar-view";


export interface DataTypeValuePack {
    renderer: DefaultRenderers;
    base_type: DefaultDataTypes;
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
                        <div class="custom-view">JSON: {JSON.stringify(props.value?.value)}</div>
                    </Match>
                    <Match when={output().renderer === DefaultRenderers.NOT_IMPLEMENTED}>
                        <span>Can't render Unknown Type</span>
                    </Match>
                </Switch>
            </Show>}
        </Show>
    );
};

