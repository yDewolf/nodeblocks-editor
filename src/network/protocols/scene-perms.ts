export enum ScenePermission {
    NONE = 0,
    READ = 1,
    EXECUTE = 2,
    EDIT = 4,
    ADMIN = 8,

    VIEWER = 1,
    OPERATOR = 1 | 2,
    EDITOR = 1 | 2 | 4,
    ALL = 1 | 2 | 4 | 8
}

export function hasPermission(currentPerms: number, permission: ScenePermission): boolean {
    return (currentPerms & permission) == permission;
}

export function togglePermission(currentPerms: number, permission: ScenePermission): number {
    return currentPerms ^ permission;
}
