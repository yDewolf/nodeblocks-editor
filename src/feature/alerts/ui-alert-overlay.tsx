import { For, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { alertController, UIAlertController, UIAlertItem } from "./ui-alert-controller";
import "~/style/components/ui-alert-overlay.css";
import CloseIcon from '~/assets/icons/close.svg';
import { NotificationIcon } from "../editor/components/notification-badges";

export const UIAlertOverlay = (props: {
    controller?: UIAlertController;
}) => {
    const controller = () => props.controller ?? alertController;

    return (
        <Portal>
            <div class="ui-alert-overlay">
                <For each={controller().alerts}>
                    {(alert) => <UIAlertCard alert={alert} controller={controller()}/>}
                </For>
            </div>
        </Portal>
    );
}

const UIAlertCard = (props: {
    alert: UIAlertItem,
    controller: UIAlertController
}) => {
    return (
        <div
            class="ui-alert-card container"
            data-level={props.alert.level}
        >
            <div class="ui-alert-header keep row-container fill space-between center-items">
                <div class="keep row-container">
                    <NotificationIcon level={props.alert.level} iconClass="smaller-icon "/>
                    <Show when={props.alert.title}>
                        <h4 class="ui-alert-title">{props.alert.title}</h4>
                    </Show>
                </div>
                <Show when={props.alert.dismissible}>
                    <button
                        type="button"
                        class="icon-button ui-alert-close-btn smaller-icon"
                        onClick={() => props.controller.dismiss(props.alert.id)}
                    >
                        <CloseIcon/>
                    </button>
                </Show>
            </div>
            <div class="ui-alert-content">
                <p class="ui-alert-message">{props.alert.message}</p>
            </div>
            <div class="ui-alert-actions">
                <Show when={props.alert.action}>
                    {(action) => (
                        <button
                            type="button"
                            class="text-button"
                            onClick={() => {
                                action().onclick();
                                props.controller.dismiss(props.alert.id);
                            }}
                        >
                            {action().label}
                        </button>
                    )}
                </Show>
            </div>
        </div>
    )
}