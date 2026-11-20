import { nanoid } from "nanoid";
import { createStore, SetStoreFunction } from "solid-js/store";
import { NotificationLevel } from "~/protocols/notification-protocol";

export interface UIAlertAction {
    label: string;
    onclick: () => void;
}

export interface UIAlertItem {
    id: string;
    title?: string;
    message: string;
    level: NotificationLevel;
    durationMs: number;
    dismissible: boolean;
    action?: UIAlertAction;
}

export interface ShowAlertOptions {
    title?: string;
    message: string;
    level?: NotificationLevel;
    durationMs?: number; // 0 -> doesn't disappear
    dismissible?: boolean;
    action?: UIAlertAction;
}

interface AlertStore {
    alerts: UIAlertItem[];
}

export class UIAlertController {
    private _store: AlertStore;
    private _setStore: SetStoreFunction<AlertStore>;
    private timers = new Map<string, number>();
    private maxVisibleAlerts: number;

    constructor(maxVisibleAlerts: number = 5) {
        this.maxVisibleAlerts = maxVisibleAlerts;
        [this._store, this._setStore] = createStore<AlertStore>({
            alerts: [],
        });
    }

    get alerts(): readonly UIAlertItem[] {
        return this._store.alerts;
    }

    public show(options: ShowAlertOptions): string {
        const id = nanoid(6);
        const durationMs = options.durationMs ?? 4500;

        const alert: UIAlertItem = {
            id,
            title: options.title,
            message: options.message,
            level: options.level ?? NotificationLevel.INFO,
            durationMs,
            dismissible: options.dismissible ?? true,
            action: options.action,
        };

        this._setStore("alerts", (prev) => {
            const next = [...prev, alert];
            if (next.length > this.maxVisibleAlerts) {
                const removed = next.shift();
                if (removed) this.clearTimer(removed.id);
            }
            return next;
        });

        if (durationMs > 0 && typeof window !== "undefined") {
            const timerId = window.setTimeout(() => {
                this.dismiss(id);
            }, durationMs);
            this.timers.set(id, timerId);
        }

        return id;
    }

    public info(message: string, title?: string, durationMs?: number, action?: UIAlertAction): string {
        return this.show({ message, title, level: NotificationLevel.INFO, durationMs, action });
    }

    public debug(message: string, title?: string, durationMs?: number, action?: UIAlertAction): string {
        return this.show({ message, title, level: NotificationLevel.DEBUG, durationMs, action });
    }

    public warning(message: string, title?: string, durationMs?: number, action?: UIAlertAction): string {
        return this.show({ message, title, level: NotificationLevel.WARNING, durationMs, action });
    }

    public error(message: string, title?: string, durationMs: number = 6500, action?: UIAlertAction): string {
        return this.show({ message, title, level: NotificationLevel.ERROR, durationMs, action });
    }

    public dismiss(id: string): void {
        this.clearTimer(id);
        this._setStore("alerts", (prev) => prev.filter((item) => item.id !== id));
    }

    public clearAll(): void {
        for (const id of this.timers.keys()) {
            this.clearTimer(id);
        }
        this._setStore("alerts", []);
    }

    private clearTimer(id: string): void {
        const timerId = this.timers.get(id);
        if (timerId !== undefined) {
            clearTimeout(timerId);
            this.timers.delete(id);
        }
    }
}

export const alertController = new UIAlertController();
