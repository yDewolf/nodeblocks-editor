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
        scenes: {
            title: "Cenas",
            newScene: "Nova Cena",
            savePerms: "Salvar Permissões",
            foundScenes: (sceneCount: number) => `${sceneCount} cenas foram encontradas.`,
            defaultPermissions: "Permissões Padrão",
            userPerms: "Permissões do usuário",
            perms: {
                read: "Visualizar",
                execute: "Executar",
                edit: "Editar",
                admin: "Administrador",
            },
            defaultProfiles: "Perfis Padrão",
            profiles: {
                viewer: "Leitor",
                operator: "Operador",
                editor: "Editor",
                all: "Administrador (Tudo)"
            },
            labels: {
                sceneId: "Id da cena"
            },
            actions: {
                createScene: "criar uma cena",
                viewScenes: "ver as cenas"
            }
        },
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
    },
    components: {
        login: {
            username: "Nome de usuário",
            login: "Entrar",
            logout: "Sair"
        }
    },
    messages: {
        mustBeAuthenticated: (action: string) => `Você deve se autenticar para ${action}`,
        loading: (what?: string) => ``
    },
    words: {
        unknown: "Desconhecido",
        settings: "Configurações",
        create: "Criar",
        scenes: "Cenas",
        saving: "Salvando"
    }
} satisfies typeof en;