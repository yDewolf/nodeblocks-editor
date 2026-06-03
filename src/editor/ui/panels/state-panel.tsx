import { Match, Switch } from "solid-js"
import { StateController } from "~/network/controllers/state_controller"
import { InstanceStates, LoopStates } from "~/network/websocket/websocket-protocol"
import PauseIcon from "~/assets/icons/pause.svg";
import RefreshIcon from "~/assets/icons/refresh.svg";
import PlayIcon from "~/assets/icons/play.svg";

export const StatePanel = (props: {state_controller: StateController}) => {
    return (
        <div class="keep row-container">
            <Switch fallback={<span>Not Connected</span>}>
                <Match when={props.state_controller.instance_state == InstanceStates.RUNNING}>
                    <button class="icon-button small-icon" onclick={() => props.state_controller.request_stop()}>
                        <PauseIcon/>
                    </button>
                </Match>
                <Match when={props.state_controller.instance_state == InstanceStates.WAITING}>
                    <button class="icon-button small-icon" onclick={() => props.state_controller.request_play()}>
                        <PlayIcon/>
                    </button>
                </Match>
            </Switch>
            {/* Loop States: */}
            <Switch>
                <Match when={props.state_controller.loop_state == LoopStates.AUTO_LOOP}>
                    <button class="icon-button small-icon">
                        <RefreshIcon class="auto-loop"/>
                    </button>
                </Match>
                <Match when={props.state_controller.loop_state == LoopStates.WAIT_RESUME}>
                    <button class="icon-button small-icon">
                        <RefreshIcon class="wait-resume"/>
                    </button>    
                </Match>
                <Match when={props.state_controller.loop_state == LoopStates.WAIT_STEP}>
                    <button class="icon-button small-icon">
                        <RefreshIcon class="wait-step"/>
                    </button>
                </Match>
            </Switch>
        </div>
    )
}