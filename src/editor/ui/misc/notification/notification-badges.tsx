import { For, Match, Switch } from "solid-js";
import { NotificationController } from "~/network/controllers/notification_controller";
import { NotificationLevel, ServerNotification } from "~/network/websocket/requests/notifications";

const NotificationIcon = (props: {level: NotificationLevel}) => {
    return (
        <Switch fallback={<img src="" alt="Unknown"/>}>
            <Match when={props.level == NotificationLevel.INFO}>
                <img src="" alt="Info"/>
            </Match>
            <Match when={props.level == NotificationLevel.DEBUG}>
                <img src="" alt="Debug"/>
            </Match>
            <Match when={props.level == NotificationLevel.WARNING}>
                <img src="" alt="Warning"/>
            </Match>
            <Match when={props.level == NotificationLevel.ERROR}>
                <img src="" alt="Error"/>
            </Match>
        </Switch>
    )
}

export const SidebarNotifications = (props: {notification_controller: NotificationController}) => {
    return (
        <div class="sidebar-notification container">
            <For each={props.notification_controller.forGlobal()}>
                {(notification: ServerNotification) => {
                    return (
                        <div class="notification-badge keep row-container">
                            <NotificationIcon level={notification.level}/>
                            <span>{notification.message}</span>
                        </div>
                    )
                }}
            </For>
        </div>
    )
}