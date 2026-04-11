import { NodeEditor } from "~/editor/node-editor";
import { StatePanel } from "./state-panel";
import { StateController } from "~/network/state_controller";
import { Match, Switch } from "solid-js";
import { ClientMessages, InstanceCommands, InstanceStates, LoopStates, WebsocketStatus } from "~/network/websocket-protocol";
import { WebsocketStatusController } from "~/network/status_controller";
import { NodeSceneFile } from "~/wrapper/helpers/node-scene-file";

export const ServerStatus = (props: {status_controller: WebsocketStatusController}) => {
    return (
        <Switch fallback={<div class="status disconnected" title="Disconnected"></div>}>
            <Match when={
                props.status_controller.status == WebsocketStatus.CONNECTED
            }>
                <div class="status connected" title="Connected to Server"></div>
            </Match>
            <Match when={
                props.status_controller.status == WebsocketStatus.ERROR
            }>
                <div class="status error" title="Something went wrong"></div>
            </Match>
        </Switch>
    )
}

export const ServerPanel = (props: {editor: NodeEditor, state_controller: StateController}) => {
    return (
        <div class="server-panel">
            <div class="panel-column">
                <div class="panel-row">
                    <div style={{display: "flex"}}>
                        <StatePanel state_controller={props.state_controller}/>
                        <Switch>
                            <Match when={
                                props.state_controller.loop_state == LoopStates.WAIT_STEP && props.state_controller.instance_state == InstanceStates.RUNNING
                            }>
                                <button class="icon-button" onclick={() => {props.editor._editor_client.sendCommand({type: ClientMessages.INSTANCE_COMMAND, payload: {action: InstanceCommands.STEP}})}}>
                                    <img src="assets/icons/skip-forward.svg" alt="Step" title="Step"/>
                                </button>
                            </Match>
                            <Match when={
                                props.state_controller.loop_state == LoopStates.WAIT_RESUME && props.state_controller.instance_state == InstanceStates.RUNNING
                            }>
                                <button class="icon-button" onclick={() => {props.editor._editor_client.sendCommand({type: ClientMessages.INSTANCE_COMMAND, payload: {action: InstanceCommands.STEP}})}}>
                                    <img src="assets/icons/skip-forward.svg" alt="Step" title="Step"/>
                                </button>
                            </Match>
                        </Switch>
                    </div>
                    <ServerStatus status_controller={props.editor._status_controller}/>
                </div>
                <div class="control-panel panel-row">
                    <button class="icon-button" onclick={() => {props.editor._editor_client.sendCommand({type: ClientMessages.LOAD_SCENE, payload: NodeSceneFile.scene_data_to_json(props.editor.scene_controller.gen_scene_data())})}}>
                        <img src="assets/icons/send-file.svg" alt="Upload Scene" title="Upload Scene"/>
                    </button>
                    <button class="icon-button" onclick={() => {props.editor._editor_client.sendCommand({type: ClientMessages.SYNC_CLIENT_SCENE})}}>
                        <img src="assets/icons/download-file.svg" alt="Load Scene" title="Load Scene"/>
                    </button>
                </div>
            </div>            
        </div>
    );
}