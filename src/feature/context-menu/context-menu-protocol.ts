export interface ContextMenuItem {
    id: string;
    label: string;
    icon?: string;
    shortcut?: string;
    disabled?: boolean;
    separator?: boolean;
    action?: () => void;
    children?: ContextMenuItem[];
}

export interface ContextMenuState {
    isOpen: boolean;
    x: number;
    y: number;
    items: ContextMenuItem[];
}
