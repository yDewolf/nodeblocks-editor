export default {
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
            }
        }
    }
}