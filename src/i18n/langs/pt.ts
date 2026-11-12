import en from "./en";

export default {
    locale: {
        en: "Inglês",
        pt: "Português Brasil"
    },
    themes: {
        dark: "Escuro",
        light: "Claro",
        "dark-contrast": "Escuro com Constraste",
        auto: "Automático"
    },
    routes: {
        scenes: "Cenas",
        docs: "Documentação",
    },
    pages: {
        settings: {
            title: "Configurações",
            generalTitle: "Configurações Gerais",
            editorTitle: "Configurações do Editor",
            remoteHost: {
                hostLabel: "Host do servidor",
                portLabel: "Porta do servidor",
                status: (status: string, httpUrl: string) => `Status do Servidor: ${status} (${httpUrl})`,

                serverStatusAlive: "OK",
                serverStatusDisconnected: "Desconectado",

                connecting: "Conectando...",
                connect: "Conectar com o servidor"
            },
            editor: {
                theme: "Tema",
                lang: "Idioma",
                alwaysShowSlotLabels: "Sempre mostrar nome dos slots"
            }
        }
    }
} satisfies typeof en;