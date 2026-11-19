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
            localServerTitle: "Configurações do servidor local",
            remoteServerTitle: "Configurações do servidor remoto",
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
            theme: "Tema",
            lang: "Idioma",
            autoStartLocalServer: "Iniciar o servidor local automaticamente",
            editor: {
                alwaysShowSlotLabels: "Sempre mostrar nome dos slots"
            },
        },
        setupWizard: {
            messages: {
                youCanProceed: "Você já pode prosseguir",
                youCanChangeThisLater: "Você pode alterar essa opção mais tarde."
            },
            welcome: {
                wizardInfo: "Esse utilitário vai preparar tudo que o Nodeblocks precisa para funcionar corretamente no seu computador",
                startInstructions: "Comece selecionando a sua linguagem e tema preferidos."
            },
            serverChoice: {
                localOrRemoteQuestion: "Você gostaria de rodar o Nodeblocks localmente ou conectar-se a um servidor remoto?",
                changeAnwserNote: "Você pode alterar isso a qualquer momento através do menu de configurações.",
                installAndRunLocallyOption: "Instalar e rodar Nodeblocks localmente"
            },
            install: {
                installedVersion: "Versão instalada",
                releaseSourceNote: "Todas as releases vem do",
                incompatibleReleasesNote: "Versões marcadas com ⚠️ talvez não sejam compatíveis com a versão atual do client",
                clientWasBuiltForVersion: "Esse client foi feito para a seguinte versão do servidor",
                install: "Instalar",
                messages: {
                    serverVersionIsInstalled: (version: string) => `A versão '${version}' do servidor está instalada.`,
                    installAnotherVersion: "Para instalar outra versão, use o menu abaixo.",
                    alreadyInstalled: "Nodeblocks já está instalado.",
                    installedSuccessfully: "Nodeblocks foi instalado com sucesso.",
                    checkingInstallation: "Checando instalação...",
                    installFailed: "A instalação falhou.",
                }
            },
            localTest: {
                beforeContinuingMessage: "Antes de continuar, vamos testar a conexão com o servidor local. Isso deve levar alguns segundos...",
                testingConnection: "Testando conexão...",
                runLocalTests: "Rodar testes",
                localTestsPassed: "Testes concluídos",
                connectedSuccessfully: "Conectado ao servidor com sucesso."
            },
            pluginsSetup: {
                pluginBasedNotice: "O servidor do nodeblocks é baseado em plugins. Por isso é necessário que você adicione plugins para desenvolver cenas.",
                responsibilityNotice: "Não nos responsabilizamos pelo uso de plugins desenvolvidos por terceiros.",
                howToInstallPlugins: "Como Instalar Plugins: ",
                pluginInstallStep1: "Abra a pasta de plugins do servidor",
                pluginInstallStep2: "Baixe um plugin (arquivo .nbplugin)",
                pluginInstallStep3: "Coloque o arquivo do plugin na pasta de plugins do servidor",
                pluginInstallStep4: "Reinicie o servidor e verifique se o plugin foi carregado corretamente",
                installTrustedPluginsOnly: "Instale apenas plugins de autores que você confia!",
                pluginsSetupComplete: "Os plugins foram carregados com sucesso"
            },
            createUser: {
                editorRequiresUser: "Para usar o editor você deve criar um usuário.",
                scenesAreLinkedNote: "As cenas são associadas ao seu usuário. Apenas você e usuários autorizados conseguem acessá-las.",
                sessionRemainsNote: "A sua sessão vai ser salva depois de fechar o aplicativo."
            },
            allSetUp: {
                everythingIsSet: "Tudo está configurado para você começar a criar e editar cenas!",
                thanksForUsingNodeblocks: "Obrigado por usar o Nodeblocks",
                redoSetupInstruction: "Para refazer a configuração vá até Configurações -> Abrir utilitário de instalação",
                reportIssuesHere: "Reporte problemas aqui"
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
        localServerPanel: {
            title: "Painel do Servidor Local",
            serverOutput: "Saída do servidor",
            serverVersion: "Versão instalada",
            serverStatus: "Status do Servidor",
            serverState: "Estado do Servidor",
            starting: "Iniciando",
            running: "Rodando",
            stopped: "Parado",
            disconnected: "Desconectado",
            connecting: "Conectando",
            initializing: "Inicializando",
            setting_up: "Preparando",
            ready: "Pronto",
            failed: "Falhou",
            stopServer: "Parar servidor",
            connectToLocalServer: "Conectar ao servidor local",
            openPluginsFolder: "Abrir pasta de plugins",
            startLocal: "Iniciar servidor local",
            restartServer: "Reiniciar servidor",
            startingLocal: "Iniciando..."
        },
        searchbar: {
            noResultsForQuery: "Nenhum resultado foi encontrado",
            searchPlaceholder: "Busque por algo aqui",
        },
        login: {
            username: "Nome de usuário",
            login: "Entrar",
            logout: "Sair",
            loggedAs: (user: string) => `Logado como '${user}'`
        },
        nodeTypeSelector: {
            searchPlaceholder: "Busque por nodes aqui",
            nodeTypeFilters: "Filtros de Node",
            messages: {
                noActiveFilters: "Nenhum filtro ativo",
            },
            views: {
                active_filters: "Filtros ativos",   
                tags: "Tags",   
                categories: "Categorias",   
            },
            filterTypes: {
                tag: "Tag",
                category: "Categoria"
            },
            sortModes: {
                id: "ID",
                recent: "Recentes"
            },
            displayModes: {
                by_plugin: "Por plugin",
                all: "Todos"
            }
        }
    },
    actions: {
        loadImage: "carregar imagem",
        goBack: "Voltar",
        continue: "Continuar",
        finish: "Finalizar",
        tryAgain: "Tentar novamente",
        cancel: "Cancelar",
    },
    messages: {
        mustBeAuthenticated: (action: string) => `Você deve se autenticar para ${action}`,
        loading: (what?: string) => `Carregando ${what}...`,
        isntImplementedYet: (what?: string) => `${what ?? "Isso"} ainda não foi implementado`,
        noImplementationFor: (something: string) => `Nenhuma implementação para ${something}`,
        errorWhile: (action: string) => `Erro ao ${action}`,
        noSomethingSelected: (something: string, fem?: boolean) => `Nenhum${fem ? "a" : ""} ${something} selecionad${fem ? "a" : "o"}`,
        couldntFind: (something: string) => `Não foi possível encontrar ${something}`,
        noSomethingFound: (something: string, fem?: boolean) => `Nenhum${fem ? "a" : ""} ${something} foi encontrad${fem ? "a" : "o"}`,
        noConnectionWithServer: "Você não está conectado a um servidor. Algumas coisas podem deixar de funcionar."
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
        serverVersion: "Versão do Servidor",
        engineVersion: "Versão da Engine",
        state: "Estado",
        release: "Release",
        preRelease: "Pre-release",
        originalPlugins: "Plugins originais",
        general: "Geral",
        editor: "Editor",
        localServer: "Servidor Local",
        remoteServer: "Servidor Remoto",
        filter: (plural?: boolean) => `Filtro${plural ? "s" : ""}`,
        category: (plural?: boolean) => `Categoria${plural ? "s" : ""}`
    }
} satisfies typeof en;