
export type IKeybindEvent = {
    blockNextKeybinds: () => void;
    isNextKeybindsBlocked: () => boolean;
    nativeEvent: Event;
}

export class KeybindEvent  {
    private _isBlocked: boolean;

    constructor(
        public readonly nativeEvent: Event
    ) {
        this._isBlocked = false;
    }

    public blockNextKeybinds = (): void => {
        this._isBlocked = true;
    };

    public isNextKeybindsBlocked = (): boolean => {
        return this._isBlocked;
    };
}

export function createKeybindEvent(nativeEvent: Event) { return new KeybindEvent(nativeEvent) };
