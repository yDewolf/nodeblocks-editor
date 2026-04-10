import { NodeEditor } from "~/editor/node-editor";
import { StatePanel } from "./state-panel";
import { StateController } from "~/network/state_controller";
import { Match, Switch } from "solid-js";
import { ClientMessages, InstanceCommands, LoopStates, WebsocketStatus } from "~/network/websocket-protocol";
import { WebsocketStatusController } from "~/network/status_controller";

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
            <div style={{display: "flex"}}>
                <StatePanel state_controller={props.state_controller}/>
                <Switch>
                    <Match when={
                        props.state_controller.loop_state == LoopStates.WAIT_STEP
                    }>
                        <button class="state-button" onclick={() => {props.editor._editor_client.sendCommand({type: ClientMessages.INSTANCE_COMMAND, payload: {action: InstanceCommands.STEP}})}}>
                            <img src="assets/icons/skip-forward.svg" alt="Step" />
                        </button>
                    </Match>
                </Switch>
            </div>
            <ServerStatus status_controller={props.editor._status_controller}/>
        </div>
    );
}