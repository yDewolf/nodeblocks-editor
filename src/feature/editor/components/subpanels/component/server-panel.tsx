import { StatePanel } from "./state-panel";
import { createSignal, Match, Show, Switch } from "solid-js";
import SkipForwardIcon from "~/assets/icons/skip-forward.svg";
import { StateController } from "~/feature/editor/controllers/state-controller";
import { useEditor } from "~/feature/scene-editor-context";
import { SceneWorkerExecutionMode } from "~/protocols/nodeblocks/network/scene-worker-protocol";
import { WebsocketStatus } from "~/protocols/nodeblocks/network/server-message-protocol";
import { Dropdown, Dropside } from '../../../../../components/panels/dropdown';

export const SceneStatus = () => {
    const editor = useEditor();
    return (
        <div class="status"
            classList={{
                "connected": editor.sceneConnection.status == WebsocketStatus.CONNECTED,
                "disconnected": editor.sceneConnection.status == WebsocketStatus.DISCONNECTED,
                "connecting": editor.sceneConnection.status == WebsocketStatus.CONNECTING,
                "error": editor.sceneConnection.status == WebsocketStatus.ERROR,
            }}    
        ></div>
    )
}

export const ScenePanel = (props: {state_controller: StateController}) => {
    return (
        <div class="fill keep row-container space-between">
            <div class="keep row-container">
                <StatePanel state_controller={props.state_controller}/>
                
                <Show when={props.state_controller.isRunning()}>
                    <Switch>
                        <Match when={
                            props.state_controller.runtime_mode == SceneWorkerExecutionMode.GRAPH_STEP
                        }>
                            <button class="icon-button" onclick={() => {
                                props.state_controller.requestStep();
                            }}>
                                <SkipForwardIcon class="small-icon"/>
                            </button>
                        </Match>
                        <Match when={
                            props.state_controller.runtime_mode == SceneWorkerExecutionMode.FULL_GRAPH
                        }>
                            <button class="icon-button" onclick={() => {
                                props.state_controller.requestContinue();
                            }}
                                >
                                <SkipForwardIcon class="small-icon"/>
                            </button>
                        </Match>
                    </Switch>
                </Show>
            </div>
            <div class="control-panel keep row-container">
                <select value={props.state_controller.runtime_mode} name="" id="" onInput={(e) => {
                    props.state_controller.requestModeUpdate(e.target.value as SceneWorkerExecutionMode)
                }}>
                    <option value={SceneWorkerExecutionMode.GRAPH_STEP}>Step</option>
                    <option value={SceneWorkerExecutionMode.FULL_GRAPH}>Graph</option>
                </select>
                {/* <button class="icon-button" onclick={() => {props.editor._sync_controller.send_local_scene()}}>
                    <img src="assets/icons/send-file.svg" alt="Upload Scene" title="Upload Scene"/>
                </button>
                <button class="icon-button" onclick={() => {props.editor._sync_controller.sync_with_server_scene()}}>
                    <img src="assets/icons/download-file.svg" alt="Load Scene" title="Load Scene"/>
                </button> */}
                <SceneStatus />
            </div>
        </div>
    );
}