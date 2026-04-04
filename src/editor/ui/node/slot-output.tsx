import { createMemo, Show } from "solid-js"
import { NodeSlot } from "~/wrapper/nodes/slot/node-slot"

export const SlotOutput = (props: {slot: NodeSlot}) => {
    const slot_output = createMemo(() => {
        if (props.slot.last_output) {
            if (props.slot.last_output.size == 0) {
                return null;
            }
            return Object.fromEntries(props.slot.last_output.entries());
        }
        return null;
    });
    
    return (
        <Show when={slot_output() != null}>
            <div class="slot-output">{
                JSON.stringify(slot_output())
            }</div>
        </Show>
    )
}