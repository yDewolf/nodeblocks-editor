export default {
    locale: {
        en: "English",
        pt: "Portuguese (BR)"
    },
    themes: {
        dark: "Dark",
        light: "Light",
        "dark-contrast": "Dark Constrast",
        auto: "Auto"
    },
    routes: {
        scenes: "Scenes",
        docs: "Documentation",
    },
    pages: {
        editor: {
            returnHome: "Return Home",
            saveScene: "Save Scene",
            loadScene: "Load Scene",
            exportScene: "Export Scene",
        },
        scenes: {
            title: "Scenes",
            newScene: "New Scene",
            savePerms: "Save Permissions",
            foundScenes: (sceneCount: number) => `Found ${sceneCount} scenes.`,
            defaultPermissions: "Default Permissions",
            userPerms: "User Permissions",
            perms: {
                read: "Read",
                execute: "Execute",
                edit: "Edit",
                admin: "Admin",
            },
            defaultProfiles: "Default Profiles",
            profiles: {
                viewer: "Viewer",
                operator: "Operator",
                editor: "Editor",
                all: "All (Admin)"
            },
            labels: {
                sceneId: "Scene Id"
            },
            actions: {
                createScene: "create a scene",
                viewScenes: "view scenes"
            }
        },
        settings: {
            title: "Settings",
            generalTitle: "General Settings",
            editorTitle: "Editor Settings",
            remoteHost: {
                hostLabel: "Server Host",
                portLabel: "Server Port",
                status: (status: string, httpUrl: string) => `Server Status: ${status} (${httpUrl})`,
                serverStatusAlive: "Alive",
                serverStatusDisconnected: "Disconnected",

                connecting: "Connecting...",
                connect: "Connect to a server"
            },
            editor: {
                theme: "Theme",
                lang: "Language",
                alwaysShowSlotLabels: "Always Show Slot Labels"
            }
        }
    },
    node: {
        parameters: "Parameters",
        output: "Output",
        attributes: {
            nodeFqn: "Type",
            uid: "UID",
            position: "Position",
        }
    },
    datatype: {
        shape: "Shape",
        channel: "Channel",
        message: {
            cantRender: (type: string) => `Can't render ${type} type`,
            rendererNotImplemented: "Renderer not implemented",
            noValue: "No Value",
            highDimTensor: (size: number) => `High-dimensional tensor. Size: ${size} elements`
        }
    },
    components: {
        login: {
            username: "Username",
            login: "Login",
            logout: "Logout"
        }
    },
    actions: {
        loadImage: "load image",
    },
    messages: {
        mustBeAuthenticated: (action: string) => `You must be authenticated to ${action}`,
        loading: (what?: string) => `Loading ${what}...`,
        isntImplementedYet: (what?: string) => `${what ?? "this"} isn't implemented yet`,
        errorWhile: (action: string) => `Failed to ${action}`
    },
    words: {
        unknown: "Unknown",
        settings: "Settings",
        notifications: "Notifications",
        notificationHistory: "Notification History",
        autosave: "Autosave",
        file: "File",
        create: "Create",
        close: "Close",
        scenes: "Scenes",
        saving: "Saving",
        empty: "Empty",
        artifact: "Artifact"
    }
}