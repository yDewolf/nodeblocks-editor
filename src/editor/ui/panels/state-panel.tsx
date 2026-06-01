import { Match, Switch } from "solid-js"
import { StateController } from "~/network/controllers/state_controller"
import { InstanceStates, LoopStates } from "~/network/websocket/websocket-protocol"



export const StatePanel = (props: {state_controller: StateController}) => {
    return (
        <div class="keep row-container">
            <Switch fallback={<span>Not Connected</span>}>
                <Match when={props.state_controller.instance_state == InstanceStates.RUNNING}>
                    <button class="icon-button" onclick={() => props.state_controller.request_stop()}>
                        <img class="small-icon" src="assets/icons/pause.svg" alt="Pause" />
                    </button>
                </Match>
                <Match when={props.state_controller.instance_state == InstanceStates.WAITING}>
                    <button class="icon-button" onclick={() => props.state_controller.request_play()}>
                        <img class="small-icon" src="assets/icons/play.svg" alt="Run" />
                    </button>
                </Match>
            </Switch>
            {/* Loop States: */}
            <Switch>
                <Match when={props.state_controller.loop_state == LoopStates.AUTO_LOOP}>
                    <button class="icon-button">
                        <img class="auto-loop small-icon" src="assets/icons/refresh.svg" title="Auto Loop" alt="" />
                    </button>
                </Match>
                <Match when={props.state_controller.loop_state == LoopStates.WAIT_RESUME}>
                    <button class="icon-button">
                        <img class="wait-resume small-icon" src="assets/icons/refresh.svg" title="Waiting Resume" alt="" />
                    </button>    
                </Match>
                <Match when={props.state_controller.loop_state == LoopStates.WAIT_STEP}>
                    <button class="icon-button">
                        <img class="wait-step small-icon" src="assets/icons/refresh.svg" title="Waiting Step" alt="" />
                    </button>
                </Match>
            </Switch>
        </div>
    )
}