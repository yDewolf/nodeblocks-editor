import { For, Match, Switch } from "solid-js";
import { NotificationController } from "~/network/controllers/notification_controller";
import { NotificationLevel, ServerNotification } from "~/network/websocket/requests/notifications";

const NotificationIcon = (props: {level: NotificationLevel}) => {
    return (
        <Switch fallback={<img src="" alt="Unknown"/>}>
            <Match when={props.level == NotificationLevel.INFO}>
                <span class="icon-span"><img src="public/assets/icons/notification/info.svg" alt="Info"/></span>
            </Match>
            <Match when={props.level == NotificationLevel.DEBUG}>
                <span class="icon-span"><img src="public/assets/icons/notification/debug.svg" alt="Debug"/></span>
            </Match>
            <Match when={props.level == NotificationLevel.WARNING}>
                <span class="icon-span"><img src="public/assets/icons/notification/warning.svg" alt="Warning"/></span>
            </Match>
            <Match when={props.level == NotificationLevel.ERROR}>
                <span class="icon-span"><img src="public/assets/icons/notification/error.svg" alt="Error"/></span>
            </Match>
        </Switch>
    )
}

export const SidebarNotifications = (props: {notification_controller: NotificationController}) => {
    return (
        <div class="sidebar-notifications container scrollable">
            <For each={props.notification_controller.forGlobal()}>
                {(notification: ServerNotification) => {
                    return (
                        <div class="notification-badge keep row-container padded">
                            <NotificationIcon level={notification.level}/>
                            <span>{notification.message}</span>
                        </div>
                    )
                }}
            </For>
        </div>
    )
}