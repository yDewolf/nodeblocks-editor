import { createMemo, createSignal, For, Match, Show, Switch } from "solid-js";
import { NotificationController, NotificationWithMeta } from "~/network/controllers/notification_controller";
import { NotificationLevel, NotificationTarget, ServerNotification } from "~/network/websocket/requests/notifications";

const NotificationIcon = (props: {level: NotificationLevel}) => {
    return (
        <Switch fallback={<img src="" alt="Unknown"/>}>
            <Match when={props.level == NotificationLevel.INFO}>
                <span class="icon-span small-icon"><img src="public/assets/icons/notification/info.svg" alt="Info"/></span>
            </Match>
            <Match when={props.level == NotificationLevel.DEBUG}>
                <span class="icon-span small-icon"><img src="public/assets/icons/notification/debug.svg" alt="Debug"/></span>
            </Match>
            <Match when={props.level == NotificationLevel.WARNING}>
                <span class="icon-span small-icon"><img src="public/assets/icons/notification/warning.svg" alt="Warning"/></span>
            </Match>
            <Match when={props.level == NotificationLevel.ERROR}>
                <span class="icon-span small-icon"><img src="public/assets/icons/notification/error.svg" alt="Error"/></span>
            </Match>
        </Switch>
    )
}

export const NotificationCard = (props: {notification: NotificationWithMeta, notification_controller: NotificationController}) => {
    const [expanded, setExpanded] = createSignal(false);

    const mark_as_read = () => {
        props.notification_controller.mark_as_read(props.notification);
    }

    const goto_root = () => {
        mark_as_read();
        props.notification_controller.handle_goto(props.notification);
    }
    return (
        <div 
            class="notification-badge container padded space-between"
            classList={{
                "read": props.notification.read,
                "unread": !props.notification.read,
                "fade-slow": props.notification.level == NotificationLevel.ERROR,
                "fade-fast": props.notification.level != NotificationLevel.ERROR,
                
                "error": props.notification.level == NotificationLevel.ERROR,
                "warning": props.notification.level == NotificationLevel.WARNING,
                "debug": props.notification.level == NotificationLevel.DEBUG,
                "info": props.notification.level == NotificationLevel.INFO,
            }}
            style={{"pointer-events": "auto"}}
        >
            <div class="keep row-container notification-header space-between">
                <div class="notification-content keep row-container">
                    <NotificationIcon level={props.notification.level}/>
                    <p>{props.notification.message}</p>
                    <Show when={props.notification.count > 1}>
                        <span class="stack-counter">
                            {props.notification.count}x
                        </span>
                    </Show>
                </div>
                <div class="row-container">
                    <Show when={!props.notification.read}>
                        <Show when={props.notification.target != NotificationTarget.UNSPECIFIED} 
                            fallback={
                                <button class="icon-button small-icon" onclick={mark_as_read}>
                                    <img src="public/assets/icons/checkmark.svg" alt="Read" />
                                </button>
                            }
                            >
                            <button class="icon-button small-icon" onclick={goto_root}>
                                <img src="public/assets/icons/arrow-right.svg" alt=">" />
                            </button>
                        </Show>
                    </Show>
                    <Show when={props.notification.description != undefined}>
                        <button class="icon-button small-icon" onclick={() => {if (!expanded()) setExpanded(true); else {setExpanded(false)}}}>
                            <img class="expand-icon" classList={{"expanded": expanded()}} src="public/assets/icons/arrow-down.svg" alt="Expand" />
                        </button>
                    </Show>
                </div>
            </div>
            <Show when={expanded()}>
                <div class="notification-description">
                    <p>{props.notification.description}</p>
                </div>
            </Show>
        </div>
    )
}

export const SidebarNotifications = (props: {notification_controller: NotificationController}) => {
    const [show, setShow] = createSignal(false);
    const [changingState, setChangingState] = createSignal(false);
    const delayed_set_show = (value: boolean) => {
        setChangingState(true);
        setTimeout(() => {
            setShow(value);
            setChangingState(false);
        }, 200);
    }

    const all_notifications = createMemo(() => {
        const c = props.notification_controller;
        return [
            ...c.forAll(),
        ].sort((a, b) => b.timestamp - a.timestamp);
    });

    const unread = createMemo(() => all_notifications().filter(n => !n.read));
    // const history = createMemo(() => all_notifications().filter(n => n.read));

    return (
        <div class="keep container sidebar-notification-holder">
            <div class="keep row-container" style={{"align-items": "center"}}>
                <div class="keep row-container">
                    <button classList={{"active": show()}} class="modal-button icon-button" style={{"pointer-events": "auto"}} onClick={(e) => {if (!show()) setShow(true); else delayed_set_show(false);}}>
                        <img src="assets/icons/notification/notification-bell.svg" alt="Open" />
                    </button>
                    <Show when={unread().length > 0}>
                        <span>{unread().length}</span>
                    </Show>
                </div>
                <Show when={show()}>
                    <span>History</span>
                </Show>
            </div>
            {/* Notification List */}
            <Show when={show()} fallback={
                <For each={unread()}>
                    {(notification: NotificationWithMeta) => {
                        return (
                            <NotificationCard notification={notification} notification_controller={props.notification_controller}/>
                        )
                    }}
                </For>
            }>
                <div class="sidebar-notifications container scrollable modal-content" classList={{"open": show(), "closing": show() && changingState()}}>
                    <For each={all_notifications()}>
                        {(notification: NotificationWithMeta) => {
                            return (
                                <NotificationCard notification={notification} notification_controller={props.notification_controller}/>
                            )
                        }}
                    </For>
                </div>
            </Show>
        </div>
    )
}