import { createMemo, createSignal, For, Match, Show, Switch } from "solid-js";
import { Vector2 } from "~/protocols/nodeblocks/geometry";
import InfoIcon from "~/assets/icons/notification/info.svg";
import DebugIcon from "~/assets/icons/notification/debug.svg";
import WarningIcon from "~/assets/icons/notification/warning.svg";
import ErrorIcon from "~/assets/icons/notification/error.svg";
import CheckMarkIcon from "~/assets/icons/checkmark.svg";
import ArrowRightIcon from "~/assets/icons/arrow-right.svg";
import ArrowDownIcon from "~/assets/icons/arrow-down.svg";
import BellIcon from "~/assets/icons/notification/notification-bell.svg";
import { useNotifications } from "../contexts/notification-context";
import { useSceneCanvas } from "~/feature/scene/scene-canvas-context";
import { NotificationLevel, NotificationLevelOrder, NotificationTarget, NotificationWithMeta } from "~/protocols/notification-protocol";
import { timeSignal } from "~/utils/time-utils";
import { Theme, THEMES } from '../../ui-themes';

const NotificationIcon = (props: {level: NotificationLevel}) => {
    return (
        <Switch fallback={<img src="" alt="Unknown"/>}>
            <Match when={props.level == NotificationLevel.INFO}>
                <span class="icon-span small-icon"><InfoIcon /></span>
            </Match>
            <Match when={props.level == NotificationLevel.DEBUG}>
                <span class="icon-span small-icon"><DebugIcon /></span>
            </Match>
            <Match when={props.level == NotificationLevel.WARNING}>
                <span class="icon-span small-icon"><WarningIcon /></span>
            </Match>
            <Match when={props.level == NotificationLevel.ERROR}>
                <span class="icon-span small-icon"><ErrorIcon /></span>
            </Match>
        </Switch>
    )
}

export const BaseNotification = (props: {
    notification: NotificationWithMeta, 
}) => {
    const notificationController = useNotifications();
    const sceneCanvas = useSceneCanvas();
    const [expanded, setExpanded] = createSignal(false);
    const mark_as_read = () => {
        notificationController.mark_as_read(props.notification);
    }
    const goto_root = () => {
        mark_as_read();
        notificationController.handle_goto(props.notification, sceneCanvas.canvasSpace);
    }

    return (
        <div 
            class="notification-badge container padded space-between"
            classList={{
                "read": props.notification.read,
                "unread": !props.notification.read,
                
                "error": props.notification.level == NotificationLevel.ERROR,
                "warning": props.notification.level == NotificationLevel.WARNING,
                "debug": props.notification.level == NotificationLevel.DEBUG,
                "info": props.notification.level == NotificationLevel.INFO,
            }}
            style={{"pointer-events": "auto"}}
        >
            <div class="fill keep row-container notification-header space-between">
                <div class="notification-content">
                    <NotificationIcon level={props.notification.level}/>
                    <p>{props.notification.message}</p>
                    <Show when={props.notification.count > 1}>
                        <span class="stack-counter">
                            {props.notification.count}x
                        </span>
                    </Show>
                </div>
                <div class="row-container">
                    <Show when={props.notification.target != NotificationTarget.UNSPECIFIED} fallback={
                        <Show when={!props.notification.read}>
                            <button class="icon-button small-icon" onclick={mark_as_read}>
                                <CheckMarkIcon />
                            </button>
                        </Show>
                    }>
                        <button class="icon-button small-icon" onclick={goto_root}>
                            <ArrowRightIcon />
                        </button>
                    </Show>
                    <Show when={props.notification.description != undefined}>
                        <button class="icon-button small-icon" onclick={() => {if (!expanded()) setExpanded(true); else {setExpanded(false)}}}>
                            <ArrowDownIcon class="expand-icon" classList={{"expanded": expanded()}}/>
                        </button>
                    </Show>
                </div>
            </div>
            <Show when={expanded()}>
                <div class="notification-description">
                    <p>{props.notification.message}</p>
                    <p>{props.notification.description}</p>
                </div>
            </Show>
        </div>
    )
}

export const NotificationCard = (props: {
    notification: NotificationWithMeta, 
    is_popup?: boolean
}) => {
    const notificationController = useNotifications();
    const scene_canvas = useSceneCanvas();
    const [is_compressed, setCompressed] = createSignal(props.is_popup ?? false);
    const [expanded, setExpanded] = createSignal(false);

    const mark_as_read = () => {
        notificationController.mark_as_read(props.notification);
    }

    const goto_root = () => {
        mark_as_read();
        notificationController.handle_goto(props.notification, scene_canvas.canvasSpace);
    }

    return (
        <div 
            data-theme={"light"}
            class="notification-badge animated container padded space-between"
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
                        <p class="notification-message">{props.notification.message}</p>
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
                                    <CheckMarkIcon />
                                </button>
                            </Show>
                        }>
                            <button class="icon-button small-icon" onclick={goto_root}>
                                <ArrowRightIcon />
                            </button>
                        </Show>
                        <Show when={props.notification.description != undefined}>
                            <button class="icon-button small-icon" onclick={() => {if (!expanded()) setExpanded(true); else {setExpanded(false)}}}>
                                <ArrowDownIcon class="expand-icon" classList={{"expanded": expanded()}}/>
                            </button>
                        </Show>
                    </div>
                </Show>
            </div>
            <Show when={expanded() && !is_compressed()}>
                <div class="notification-description fill">
                    <p class="notification-message">{props.notification.message}</p>
                    <p>{props.notification.description}</p>
                </div>
            </Show>
        </div>
    )
}

export const SidebarNotifications = () => {
    const notificationController = useNotifications();
    
    const [show, setShow] = createSignal(false);
    const [changingState, setChangingState] = createSignal(false);
    const set_show_delay = 300;
    const delayed_set_show = (value: boolean) => {
        setChangingState(true);
        setTimeout(() => {
            setShow(value);
            setChangingState(false);
        }, set_show_delay);
    }

    const all_notifications = createMemo(() => {
        return [
            ...notificationController.forAll(),
        ].sort((a, b) => (b.timestamp - a.timestamp)).sort((a, b) => NotificationLevelOrder.indexOf(a.level) - NotificationLevelOrder.indexOf(b.level));
    });

    const time_to_disappear_ms: number = 15 * 1000
    const recent_notifications = createMemo(() => all_notifications().filter(
        n => n.timestamp > timeSignal() - time_to_disappear_ms && !n.read
    ));
    return (
        <div class="fill keep row-container sidebar-notification-holder" style={{"flex-direction": "row-reverse"}}>
            <div class="keep container">
                <div class="keep row-container" style={{"justify-content": "right"}}>
                    <button classList={{"active": show()}} class="modal-button icon-button" style={{"pointer-events": "auto"}} onClick={(e) => {if (!show()) setShow(true); else delayed_set_show(false);}}>
                        <BellIcon />
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
                <div 
                    class="sidebar-notifications container scrollable modal-content" 
                    classList={{"open": show(), "closing": show() && changingState()}}
                    style={{"transition": `width ${set_show_delay}ms, opacity ${set_show_delay}ms;`}}
                >
                    <Show when={show()} fallback={
                        <For each={recent_notifications()}>
                            {(notification: NotificationWithMeta) => {
                                return (
                                    <NotificationCard notification={notification}/>
                                )
                            }}
                        </For>
                    }>
                        <For each={all_notifications()}>
                            {(notification: NotificationWithMeta) => {
                                return (
                                    <NotificationCard notification={notification}/>
                                )
                            }}
                        </For>
                    </Show>
                </div>
            </Show>
        </div>
    )
}

export const NotificationPopupHolder = (props: {notifications: NotificationWithMeta[], pos: Vector2}) => {
    const unread = createMemo(() => props.notifications.filter(n => !n.read));
    // const history = createMemo(() => all_notifications().filter(n => n.read));

    return (
        <Show when={unread().length > 0}>
            <div
                onPointerDown={(e) => {e.stopPropagation();}}
                onWheel={(e) => {e.stopPropagation();}}
                class="fill container sidebar-notification-holder"
                style={{
                    "margin-top": "10px",
                    "pointer-events": "auto",
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
                                />
                            )
                        }}
                    </For>
                </div>
            </div>
        </Show>
    )
}