import { Match, Show, Switch } from "solid-js"
import PauseIcon from "~/assets/icons/pause.svg";
import RefreshIcon from "~/assets/icons/refresh.svg";
import PlayIcon from "~/assets/icons/play.svg";
import { StateController } from "~/feature/editor/controllers/state_controller";
import { SceneWorkerExecutionMode } from "~/protocols/nodeblocks/network/scene-worker-protocol";

// TODO: adicionar o run continuously
export const StatePanel = (props: {state_controller: StateController}) => {
    return (
        <div class="keep row-container">
            <Show when={props.state_controller.isRunning()} fallback={
                <button class="icon-button small-icon" onclick={() => props.state_controller.request_play()}>
                    <PlayIcon/>
                </button>
            }>
                <button class="icon-button small-icon" onclick={() => props.state_controller.request_stop()}>
                    <PauseIcon/>
                </button>
            </Show>

            <Switch>
                <Match when={props.state_controller.runtime_mode == SceneWorkerExecutionMode.FULL_GRAPH}>
                    <button class="icon-button small-icon">
                        <RefreshIcon class="wait-resume"/>
                    </button>
                </Match>
                <Match when={props.state_controller.runtime_mode == SceneWorkerExecutionMode.GRAPH_STEP}>
                    <button class="icon-button small-icon">
                        <RefreshIcon class="wait-step"/>
                    </button>    
                </Match>
            </Switch>
        </div>
    )
}