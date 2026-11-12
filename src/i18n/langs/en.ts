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
    components: {
        login: {
            username: "Username",
            login: "Login",
            logout: "Logout"
        }
    },
    messages: {
        mustBeAuthenticated: (action: string) => `You must be authenticated to ${action}`,
        loading: (what?: string) => `Loading ${what}...`
    },
    words: {
        unknown: "Unknown",
        settings: "Configurações",
        create: "Create",
        scenes: "Scenes",
        saving: "Saving"
    }
}