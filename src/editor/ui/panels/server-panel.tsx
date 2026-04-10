import { NodeEditor } from "~/editor/node-editor";
import { NodeServerClient } from "~/network/websocket-handler";
import { StatePanel } from "./state-panel";
import { StateController } from "~/network/state_controller";
import { Match, Switch } from "solid-js";
import { WebsocketStatus } from "~/network/websocket-protocol";

export const ServerPanel = (props: {editor: NodeEditor, state_controller: StateController}) => {
    
    return (
        <div class="server-panel">
            <Switch fallback={<span>Disconnected</span>}>
                <Match when={
                    props.editor._status_controller.status == WebsocketStatus.CONNECTED
                }>
                    {/* TODO */}
                </Match>
                <Match when={
                    props.editor._status_controller.status == WebsocketStatus.DISCONNECTED
                }>
                    {/* TODO */}
                </Match>
            </Switch>
            <StatePanel state_controller={props.state_controller}/>
        </div>
    );
}