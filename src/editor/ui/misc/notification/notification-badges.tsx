import { createMemo, createSignal, For, Match, Show, Switch } from "solid-js";
import { timeSignal } from "~/editor/utils/time-ticker";
import { NotificationController } from "~/network/controllers/notification_controller";
import { NotificationLevel, NotificationTarget, NotificationWithMeta, ServerNotification } from "~/network/websocket/requests/notifications";
import { Vector2 } from "~/wrapper/data_types/geometry";

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

export const NotificationCard = (props: {notification: NotificationWithMeta, notification_controller: NotificationController, is_popup?: boolean}) => {
    const [is_compressed, setCompressed] = createSignal(props.is_popup ?? false);
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
                "popup": props.is_popup ?? false,
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
            <div class="fill keep row-container notification-header space-between">
                <div class="notification-content">
                    <button class="icon-button" onclick={() => {if (props.is_popup && is_compressed()) setCompressed(false); else if (props.is_popup) setCompressed(true)}}>
                        <NotificationIcon level={props.notification.level}/>
                    </button>
                    <Show when={!is_compressed()}>
                        <p>{props.notification.message}</p>
                    </Show>
                    <Show when={props.notification.count > 1}>
                        <span class="stack-counter">
                            {props.notification.count}x
                        </span>
                    </Show>
                </div>
                <Show when={!is_compressed()}>
                    <div class="row-container">
                        <Show when={!props.is_popup && props.notification.target != NotificationTarget.UNSPECIFIED} fallback={
                            <Show when={!props.notification.read}>
                                <button class="icon-button small-icon" onclick={mark_as_read}>
                                    <img src="public/assets/icons/checkmark.svg" alt="Read" />
                                </button>
                            </Show>
                        }>
                            <button class="icon-button small-icon" onclick={goto_root}>
                                <img src="public/assets/icons/arrow-right.svg" alt=">" />
                            </button>
                        </Show>
                        <Show when={props.notification.description != undefined}>
                            <button class="icon-button small-icon" onclick={() => {if (!expanded()) setExpanded(true); else {setExpanded(false)}}}>
                                <img class="expand-icon" classList={{"expanded": expanded()}} src="public/assets/icons/arrow-down.svg" alt="Expand" />
                            </button>
                        </Show>
                    </div>
                </Show>
            </div>
            <Show when={expanded() && !is_compressed()}>
                <div class="notification-description">
                    <p>{props.notification.message}</p>
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
        }, 300);
    }

    const all_notifications = createMemo(() => {
        const c = props.notification_controller;
        return [
            ...c.forAll(),
        ].sort((a, b) => b.timestamp - a.timestamp);
    });

    const time_to_disappear_ms: number = 15 * 1000
    const recent_notifications = createMemo(() => all_notifications().filter(
        n => n.timestamp > timeSignal() - time_to_disappear_ms && !n.read
    ));
    return (
        <div class="keep container sidebar-notification-holder">
            <div class="keep row-container" style={{"align-items": "center"}}>
                <div class="keep row-container">
                    <button classList={{"active": show()}} class="modal-button icon-button" style={{"pointer-events": "auto"}} onClick={(e) => {if (!show()) setShow(true); else delayed_set_show(false);}}>
                        <img src="assets/icons/notification/notification-bell.svg" alt="Open" />
                    </button>
                    <Show when={recent_notifications().length > 0}>
                        <span>{recent_notifications().length}</span>
                    </Show>
                </div>
                <Show when={show()}>
                    <span>History</span>
                </Show>
            </div>
            {/* Notification List */}
            <Show when={recent_notifications().length > 0 || all_notifications().length > 0 && show()}>
                <div class="sidebar-notifications container scrollable modal-content" classList={{"open": show(), "closing": show() && changingState()}}>
                    <Show when={show()} fallback={
                        <For each={recent_notifications()}>
                            {(notification: NotificationWithMeta) => {
                                return (
                                    <NotificationCard notification={notification} notification_controller={props.notification_controller}/>
                                )
                            }}
                        </For>
                    }>
                        <For each={all_notifications()}>
                            {(notification: NotificationWithMeta) => {
                                return (
                                    <NotificationCard notification={notification} notification_controller={props.notification_controller}/>
                                )
                            }}
                        </For>
                    </Show>
                </div>
            </Show>
        </div>
    )
}

export const NotificationPopupHolder = (props: {notification_controller: NotificationController, notifications: NotificationWithMeta[], pos: Vector2}) => {
    const unread = createMemo(() => props.notifications.filter(n => !n.read));
    // const history = createMemo(() => all_notifications().filter(n => n.read));

    return (
        <Show when={unread().length > 0}>
            <div
                onPointerDown={(e) => {e.stopPropagation();}}
                onWheel={(e) => {e.stopPropagation();}}
                class="fill container sidebar-notification-holder"
                style={{
                    "pointer-events": "auto",
                    position: "absolute",
                    transform: `translate(${props.pos.x}px, ${props.pos.y}px)`,
                    "z-index": 2
                }}
            >
                <div class="fill popup-notifications container modal-content">
                    <For each={unread()}>
                        {(notification: NotificationWithMeta) => {
                            return (
                                <NotificationCard 
                                    is_popup={true} 
                                    notification={notification} 
                                    notification_controller={props.notification_controller}
                                />
                            )
                        }}
                    </For>
                </div>
            </div>
        </Show>
    )
}