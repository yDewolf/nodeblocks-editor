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
            run: "Executar",
            iterations: "iterações",
            runtimeStates: {
                once: "uma vez",
                forever: "para sempre",
                for: "durante"
            },
            runtimeModes: {
                step: "Próximo Passo",
                graph: "Grafo inteiro",
            }
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
            openSetupWizard: "Abrir utilitário de instalação",
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
            },
            setupWizard: {
                title: "Configuração do Nodeblocks",
                finishSetup: "Finalizar configuração",
                serverOutput: "Saída do servidor",
                messages: {
                    alreadyConnected: (http: string) => `você já está conectado em: ${http}`
                },
                start: {
                    title: "Como você gostaria de rodar o Nodeblocks?",
                    description: "Você pode instalar o servidor e rodá-lo localmente ou se conectar a um servidor remoto.",
                    installLocally: "Instalar servidor local",
                    connectToRemote: "Conectar a um servidor remoto",
                    startLocal: "Iniciar servidor local",
                    startingLocal: "Iniciando..."
                },
                install: {
                    title: "Instalação do Nodeblocks",
                    setupInfo: "Para rodar o servidor do nodeblocks localmente, esse utilitário instalará o a biblioteca nodeblocks e suas dependências",
                    setupInfo1: "Essa ação precisa de internet e pode levar alguns minutos.",
                    install: "Instalar",
                    messages: {
                        alreadyInstalled: "Nodeblocks já está instalado.",
                        installedSuccessfully: "Nodeblocks foi instalado com sucesso.",
                        checkingInstallation: "Checando instalação...",
                        installFailed: "A instalação falhou.",
                    }
                }
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
    notifications: {
        engine: {
            shortMessage: {
                runtimeError: "Erro de execução",
                failedProcess: "Falha no processo",
                jobStatus: (status: string) => `Processo ${status}`,
                nodeStatus: (status: string) => `Status do Node: ${status}`,
                default: "Evento da Engine",
            },
            description: {
                runtimeErrorFallback: "Falha ao processar um node...",
                failedProcessFallback: "Falha ao processar a cena...",
                jobStatus: (status: string) => `O status de processamento da cena mudou para: '${status}'.`,
                nodeStatus: (status: string) => `O status de execução do node mudou para: '${status}'.`,
            },
        },
        command: {
            shortMessage: {
                addNode: "Cmd: Add Node",
                addConn: "Cmd: Add Conexão",
                executionStateSync: "Cmd: Sincronizar estado",
                getSceneData: "Cmd: Fetch Scene",
                sceneWorker: "Cmd: Worker Action",
                saveScene: "A cena foi salva",
                default: (cmdType?: string) => `Cmd: ${cmdType || "Desconhecido"}`,
            },
            description: {
                addNode: (total: number, requestId: string, statusMessage?: string) =>
                    `Os nodes foram adicionados. Total: ${total}. (request id: ${requestId}) ${statusMessage ?? ""}`.trim(),
                addConn: (total: number, requestId: string, statusMessage?: string) =>
                    `As conexões foram criadas. Total: ${total}. (request id: ${requestId}) ${statusMessage ?? ""}`.trim(),
                executionStateSync: (mode: string, state: string, statusMessage?: string) =>
                    `O estado de execução foi sincronizado. Mode: [${mode}], State: [${state}]. ${statusMessage ?? ""}`.trim(),
                getSceneData: "Os dados da cena foram sincronizados",
                sceneWorker: (requestId: string, statusMessage?: string) =>
                    `Ação do worker foi processada. (request id: ${requestId}) ${statusMessage ?? ""}`.trim(),
                saveScene: (statusMessage?: string) =>
                    `A cena foi salva no servidor. ${statusMessage ?? ""}`.trim(),
            },
        },
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
        goBack: "Voltar",
        tryAgain: "Tentar novamente",
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
        details: "Detalhes",
        note: "OBS",
        serverRelease: "Server Release",
    }
} satisfies typeof en;