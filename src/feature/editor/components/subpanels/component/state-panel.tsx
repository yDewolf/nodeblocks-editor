import { createEffect, createSignal, Match, onMount, Show, Switch } from 'solid-js';
import PauseIcon from "~/assets/icons/pause.svg";
import RefreshIcon from "~/assets/icons/refresh.svg";
import PlayIcon from "~/assets/icons/play.svg";
import { StateController } from "~/feature/editor/controllers/state-controller";
import { SceneWorkerExecutionMode, SceneWorkerExecutionState } from "~/protocols/nodeblocks/network/scene-worker-protocol";
import { Dropdown } from "~/components/panels/dropdown";
import SkipForwardIcon from '~/assets/icons/skip-forward.svg';

// TODO: mostrar a iteração atual e quantas faltam pra acabar
type RunType = "once" | "forever" | "for";
export const StatePanel = (props: {state_controller: StateController}) => {
    const [runType, setRunType] = createSignal<RunType>();
    const [iterations, setIterations] = createSignal<number | undefined>(props.state_controller.target_iterations);
    onMount(() => {
        // FIXME
        setRunType(props.state_controller.runtime_state == SceneWorkerExecutionState.RUNNING_CONTINUOUS ? (
            props.state_controller.target_iterations != undefined ? "for" : "forever"
        ) : "once");
    });
    return (
        <div class="keep row-container">
            <Show when={
                props.state_controller.isRunning() 
                && 
                props.state_controller.runtime_state == SceneWorkerExecutionState.RUNNING_CONTINUOUS
            } fallback={
                <div class="button-with-dropdown-holder">
                    <button class="icon-button small-icon" onclick={(e) => {
                        const type = runType();
                        switch (type) {
                            case "once": 
                                props.state_controller.requestPlay();
                                break;
                            case "forever": 
                                props.state_controller.requestPlayContinuously(undefined);
                                break;
                            case "for":
                                props.state_controller.requestPlayContinuously(iterations());
                                break;    
                        }
                    }}>
                        <Switch fallback={
                            <PlayIcon/>
                        }>
                            <Match when={
                                props.state_controller.runtime_mode == SceneWorkerExecutionMode.GRAPH_STEP
                                && runType() == "once"
                            }>
                                <SkipForwardIcon />
                            </Match>
                        </Switch>
                    </button>
                    <Dropdown>
                        <div
                            class="fill dropdown-item-grid">
                            <div class="keep row-container">
                                Run <select value={runType()} onchange={(e) => {
                                    setRunType(e.target.value as RunType)
                                }}>
                                    <option value="once">once</option>
                                    <option value="forever">forever</option>
                                    <option value="for">for</option>
                                </select> <Show when={runType() == "for"}>
                                    <input 
                                        value={iterations()}
                                        type="number" incremental={true} min={1} 
                                        style={{width: "42px"}}
                                        onchange={(e) => setIterations(Number.parseInt(e.target.value))}
                                    />
                                    iterations
                                </Show>
                            </div>
                        </div>
                    </Dropdown>
                </div>
            }>
                <button class="icon-button small-icon" onclick={() => props.state_controller.request_stop()}>
                    <PauseIcon/>
                </button>
            </Show>

            {/* <Switch>
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
            </Switch> */}
        </div>
    )
}