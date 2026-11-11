import { Component, createSignal, onMount, ParentComponent, Show } from "solid-js";
import { RemoteServerConfigForm } from "./remote-server-setup";
import { LocalServerSetupContent } from './setup-screen';
import "~/style/screens/setup/setup.css";

export const SetupRoute: ParentComponent = (props) => {
    return (
        <SetupWizard />
    )
}


export const SetupWizard: Component = (props) => {
    const [isMounted, setIsMounted] = createSignal(false);
    onMount(() => {
        setIsMounted(true);
    });

    return (
        <Show when={isMounted()}>
            <div class="container">
                <RemoteServerConfigForm/>
                <LocalServerSetupContent onReady={() => {}} isFirstInstall={false}/>
            </div>
        </Show>
    )
}
