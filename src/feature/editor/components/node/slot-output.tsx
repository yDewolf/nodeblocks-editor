import { createMemo, Show } from "solid-js"
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot"
import { _SlotOutputPack, DataTypeValueSelector } from "./output/node-output";

export const SlotOutput = (props: {slot: NodeSlot}) => {
    const slot_output = createMemo(() => {
        if (props.slot.last_output) {
            if (props.slot.last_output.value.size == 0) {
                return undefined;
            }
            const pack: _SlotOutputPack = {
                slot_id: props.slot.slot_id,
                output: props.slot.last_output
            };
            return pack;
        }
        return undefined;
    });

    return (
        <Show when={slot_output() != null}>
            <div class="slot-output">
                <DataTypeValueSelector output_renderer={props.slot.data_type.renderer} value={slot_output()}/>
            </div>
        </Show>
    )
}