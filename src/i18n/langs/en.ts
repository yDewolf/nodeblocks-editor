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
    words: {
        unknown: "Unknown",
        settings: "Configurações",
    }
}