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
        docs: {
            datatypeObject: "objeto DataType",
            docsType: "tipo de documentação",
            loadDocs: "carregar documentação",
            parseNodePreview: "gerar preview do node",
            messages: {
                previousTabsShowUp: "Abas abertas anteriormente aparecem aqui.",
                noTopicFound: "Nenhum tópico foi encontrado",
                noParametersForRenderer: "Nenhum parâmetro disponível para esse renderizador",
                nodeHasNoSlots: "Esse node não tem nenhum slot",
                nodeHasNoParam: "Esse node não tem nenhum parâmetro",
                searchForTopics: "Busque por tópicos",
            },
            howToDocs: {
                title: "Você pode visualizar a documentação de datatypes, nodes e elementos da interface usando:",
                usingTool: "A ferramenta de documentação para selecionar um elemento",
                usingIndex: "O índice da documentação (aba à esquerda)",
                usingUrl: "O link do seu browser. (Adicione #docs=<caminho.para.documentacao> no url)"
            },
            labels: {
                meta_version: "Versão dos Metadados",
                last_modified: "Última modificação",
            },
            sections: {
                colorScheme: "Esquema de Cores",
                allTags: "Todas as Tags",
                outputPreview: "Previsualização de Saída",
                slots: "Slots",
            }
        },
        editor: {
            returnHome: "Voltar ao início",
            saveScene: "Salvar Cena",
            loadScene: "Carregar Cena",
            exportScene: "Exportar Cena",
        },
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
    node: {
        parameters: "Parâmetros",
        output: "Saída",
        attributes: {
            nodeFqn: "Tipo",
            uid: "UID",
            position: "Posição",
        }
    },
    datatype: {
        shape: "Forma",
        channel: "Canal",
        message: {
            cantRender: (type: string) => `Não é possível renderizar o tipo ${type}`,
            rendererNotImplemented: "Renderizador não implementado",
            noValue: "Nenhum Valor",
            highDimTensor: (size: number) => `Tensor com muitas dimensões. Tamanho: ${size} elementos`
        }
    },
    components: {
        login: {
            username: "Nome de usuário",
            login: "Entrar",
            logout: "Sair"
        }
    },
    actions: {
        loadImage: "carregar imagem",
    },
    messages: {
        mustBeAuthenticated: (action: string) => `Você deve se autenticar para ${action}`,
        loading: (what?: string) => `Carregando ${what}...`,
        isntImplementedYet: (what?: string) => `${what ?? "Isso"} ainda não foi implementado`,
        noImplementationFor: (something: string) => `Nenhuma implementação para ${something}`,
        errorWhile: (action: string) => `Erro ao ${action}`,
        noSomethingSelected: (something: string, fem?: boolean) => `Nenhum${fem ? "a" : ""} ${something} selecionad${fem ? "a" : "o"}`,
        couldntFind: (something: string) => `Não foi possível encontrar ${something}`
    },
    words: {
        unknown: "Desconhecido",
        documentation: "Documentação",
        description: "Descrição",
        usages: "Usos",
        settings: "Configurações",
        notifications: "Notificações",
        notificationHistory: "Histórico de Notificações",
        autosave: "Salvamento Automático",
        file: "Arquivo",
        close: "Fechar",
        create: "Criar",
        scenes: "Cenas",
        saving: "Salvando",
        empty: "Vazio",
        artifact: "Artefato",
        id: "Id",
        version: "Versão",
        index: "Índice",
        attributes: "Atributos",
        renderer: "Renderizador",
        baseType: "Tipo base",
        input: "Entrada",
        output: "Saída",
        undefined: "Indefinido",
        min: "Mínimo",
        max: "Máximo",
        sample: "Amostra",
        preview: "Pré Visualização",
        widget: "Widget",
        defaultValue: "Valor padrão",
        tags: "Tags",
    }
} satisfies typeof en;