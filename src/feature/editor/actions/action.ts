import { nanoid } from "nanoid";
import { ClientCommand } from "~/protocols/nodeblocks/network/message/client-commands";
import { EditorActionStatus } from "~/protocols/nodeblocks/network/server-message-protocol";
import { NodeScene } from "../engine/node_scene";

export type StatusChangeListener = (status: EditorActionStatus) => void;

export abstract class Action<TCommand extends ClientCommand = ClientCommand> {
    public readonly uid: string;
    public readonly isClientside: boolean;

    private _status: EditorActionStatus = EditorActionStatus.UNSYNCED;
    private _listeners: Set<StatusChangeListener> = new Set();

    constructor(isClientside: boolean = false) {
        this.uid = nanoid(6);
        this.isClientside = isClientside;
    }

    public get status(): EditorActionStatus {
        return this._status;
    }

    public setStatus(newStatus: EditorActionStatus): void {
        if (this._status === newStatus) return;
        this._status = newStatus;
        this._listeners.forEach((listener) => listener(newStatus));
    }

    public onStatusChange(listener: StatusChangeListener): () => void {
        this._listeners.add(listener);
        return () => this._listeners.delete(listener);
    }

    public abstract toServerMessage(): TCommand;

    public abstract apply(scene: NodeScene): void;

    public abstract revert(scene: NodeScene): void;
}