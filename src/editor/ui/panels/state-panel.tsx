import { Match, Switch } from "solid-js"
import { StateController } from "~/network/state_controller"
import { InstanceStates } from "~/network/websocket-protocol"



export const StatePanel = (props: {state_controller: StateController}) => {
    return (
        <div class="state-panel">
            <Switch fallback={<span>Not Connected</span>}>
                <Match when={props.state_controller.instance_state == InstanceStates.RUNNING}>
                    <button class="state-button" onclick={() => props.state_controller.request_stop()}>
                        <img src="assets/icons/pause.svg" alt="Running" />
                    </button>
                </Match>
                <Match when={props.state_controller.instance_state == InstanceStates.WAITING}>
                    <button class="state-button" onclick={() => props.state_controller.request_play()}>
                        <img src="assets/icons/play.svg" alt="Paused" />
                    </button>
                </Match>
            </Switch>
            Loop State: {props.state_controller.loop_state}
        </div>
    )
}