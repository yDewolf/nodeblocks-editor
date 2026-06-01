import { NodeEditor } from "~/editor/node-editor";
import { StatePanel } from "./state-panel";
import { StateController } from "~/network/controllers/state_controller";
import { Match, Switch } from "solid-js";
import { ClientMessages, InstanceCommands, InstanceStates, LoopStates, WebsocketStatus } from "~/network/websocket/websocket-protocol";
import { WebsocketStatusController } from "~/network/controllers/status_controller";

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
        <div class="fill keep row-container space-between">
            <div class="keep row-container">
                <StatePanel state_controller={props.state_controller}/>
                <Switch>
                    <Match when={
                        props.state_controller.loop_state == LoopStates.WAIT_STEP && props.state_controller.instance_state == InstanceStates.RUNNING
                    }>
                        <button class="icon-button" onclick={() => {props.editor._editor_client.sendCommand({type: ClientMessages.INSTANCE_COMMAND, payload: {action: InstanceCommands.STEP}})}}>
                            <img class="small-icon" src="assets/icons/skip-forward.svg" alt="Step" title="Step"/>
                        </button>
                    </Match>
                    <Match when={
                        props.state_controller.loop_state == LoopStates.WAIT_RESUME && props.state_controller.instance_state == InstanceStates.RUNNING
                    }>
                        <button class="icon-button" onclick={() => {props.editor._editor_client.sendCommand({type: ClientMessages.INSTANCE_COMMAND, payload: {action: InstanceCommands.RESUME}})}}>
                            <img class="small-icon" src="assets/icons/skip-forward.svg" alt="Resume" title="Resume"/>
                        </button>
                    </Match>
                </Switch>
            </div>
            <div class="control-panel keep row-container">
                <select name="" id="" onInput={(e) => {
                    props.editor._editor_client.sendCommand({
                        type: ClientMessages.SET_INSTANCE_LOOP_STATE,
                        payload: {state: e.currentTarget.value as LoopStates}
                    });
                }}>
                    <option value={LoopStates.WAIT_STEP}>Step</option>
                    <option value={LoopStates.WAIT_RESUME}>Resume</option>
                    <option value={LoopStates.AUTO_LOOP}>Auto Loop</option>
                </select>
                {/* <button class="icon-button" onclick={() => {props.editor._sync_controller.send_local_scene()}}>
                    <img src="assets/icons/send-file.svg" alt="Upload Scene" title="Upload Scene"/>
                </button>
                <button class="icon-button" onclick={() => {props.editor._sync_controller.sync_with_server_scene()}}>
                    <img src="assets/icons/download-file.svg" alt="Load Scene" title="Load Scene"/>
                </button> */}
                <ServerStatus status_controller={props.editor._status_controller}/>
            </div>
        </div>
    );
}