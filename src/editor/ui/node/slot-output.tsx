import { createMemo, Show } from "solid-js"
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot"
import { OutputSelector } from "./output/node-output";

export const SlotOutput = (props: {slot: NodeSlot}) => {
    const slot_output = createMemo(() => {
        if (props.slot.last_output) {
            if (props.slot.last_output.size == 0) {
                return undefined;
            }
            return [props.slot.slot_name, props.slot.last_output];
        }
        return undefined;
    });

    return (
        <Show when={slot_output() != null}>
            <div class="slot-output">
                <OutputSelector output_type={props.slot.data_type.super_type} output_value={slot_output()}/>
            </div>
        </Show>
    )
}