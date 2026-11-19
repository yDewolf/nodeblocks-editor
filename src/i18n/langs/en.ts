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
        docs: {
            datatypeObject: "DataType Object",
            docsType: "documentation type",
            loadDocs: "load documentation",
            parseNodePreview: "parse node preview",
            messages: {
                previousTabsShowUp: "Previous opened tabs show up here.",
                noParametersForRenderer: "No parameters available for this renderer",
                nodeHasNoSlots: "This node has no slots",
                nodeHasNoParam: "This node has no parameters",
                searchForTopics: "Search for topics",
            },
            howToDocs: {
                title: "You can view documentation about datatypes, nodetypes and interface elements by:",
                usingTool: "selecting an element with the docs tool",
                usingIndex: "using the documentation index (left tab in this view)",
                usingUrl: "inserting #docs=<path.to.documentation> in your browser's url"
            },
            labels: {
                meta_version: "Metadata Version",
                last_modified: "Last Modified",
            },
            sections: {
                colorScheme: "Color Scheme",
                allTags: "All Tags",
                outputPreview: "Output Preview",
                slots: "Slots",
            }
        },
        editor: {
            returnHome: "Return Home",
            saveScene: "Save Scene",
            loadScene: "Load Scene",
            exportScene: "Export Scene",
            run: "Run",
            iterations: "iterações",
            runtimeStates: {
                once: "Once",
                forever: "Forever",
                for: "For"
            },
            runtimeModes: {
                step: "Step",
                graph: "Full Graph",
            }
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
            localServerTitle: "Local Server Settings",
            remoteServerTitle: "Remote Server Settings",
            openSetupWizard: "Open Setup Wizard",
            remoteHost: {
                hostLabel: "Server Host",
                portLabel: "Server Port",
                status: (status: string, httpUrl: string) => `Server Status: ${status} (${httpUrl})`,
                serverStatusAlive: "Alive",
                serverStatusDisconnected: "Disconnected",

                connecting: "Connecting...",
                connect: "Connect to a server"
            },
            theme: "Theme",
            lang: "Language",
            autoStartLocalServer: "Start local server on app startup",
            editor: {
                alwaysShowSlotLabels: "Always Show Slot Labels"
            },
        },
        setupWizard: {
            messages: {
                youCanProceed: "You can proceed",
                youCanChangeThisLater: "Você pode alterar essa opção mais tarde."
            },
            welcome: {
                wizardInfo: "This wizard will prepare everything Nodeblocks needs to run on your computer",
                startInstructions: "Start by selecting your prefered UI theme and language."
            },
            serverChoice: {
                localOrRemoteQuestion: "Would you like to run Nodeblocks locally or connect to a remote server?",
                changeAnwserNote: "you can change your answer anytime by redoing this setup in settings menu.",
                installAndRunLocallyOption: "Install nodeblocks and run locally"
            },
            install: {
                installedVersion: "Installed Version",
                releaseSourceNote: "All releases come from",
                incompatibleReleasesNote: "Beware that versions marked with ⚠️ might not be compatible with this client's version.",
                clientWasBuiltForVersion: "This client was built for server version",
                install: "Install",
                messages: {
                    serverVersionIsInstalled: (version: string) => `Server '${version}' is installed.`,
                    alreadyInstalled: "Nodeblocks is already installed.",
                    installAnotherVersion: "If you wish, you can install another version using the menu below",
                    installedSuccessfully: "Nodeblocks was installed successfully.",
                    checkingInstallation: "Checking installation...",
                    installFailed: "The installation failed.",
                }
            },
            localTest: {
                beforeContinuingMessage: "Before continuing, setup wizard will test the local server installation. This might take a sec...",
                testingConnection: "Testing Connection...",
                runLocalTests: "Run Local Tests",
                localTestsPassed: "Tests Passed",
                connectedSuccessfully: "Connected to server successfully."
            },
            pluginsSetup: {
                pluginBasedNotice: "Nodeblocks server is a plugin-based software. That means it doesn't do much without plugins installed. To develop scenes you must have some plugins installed.",
                responsibilityNotice: "We are not responsible for the use of third-party plugins.",
                howToInstallPlugins: "How to install plugins: ",
                pluginInstallStep1: "Open server plugins folder",
                pluginInstallStep2: "Download a plugin (.nbplugin file)",
                pluginInstallStep3: "Place the file inside server plugins folder",
                pluginInstallStep4: "Restart the server and verify if your plugin loaded correctly",
                installTrustedPluginsOnly: "Only install plugins from trusted sources!",
                pluginsSetupComplete: "Plugins were loaded successfully"
            },
            createUser: {
                editorRequiresUser: "To use the editor, you must create a user.",
                scenesAreLinkedNote: "All scenes you create are linked to your user. Only you, and allowed users, can see them.",
                sessionRemainsNote: "Your session will remain after closing the app."
            },
            allSetUp: {
                everythingIsSet: "Everything is ready for you to create and edit scenes now!",
                thanksForUsingNodeblocks: "Thanks for using Nodeblocks",
                redoSetupInstruction: "To do the setup again you must go to Settings -> Open Setup Wizard",
                reportIssuesHere: "Report issues here"
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
    notifications: {
        engine: {
            shortMessage: {
                runtimeError: "Runtime Error",
                failedProcess: "Process Failure",
                jobStatus: (status: string) => `Process ${status}`,
                nodeStatus: (status: string) => `Node Status: ${status}`,
                default: "Engine Event",
            },
            description: {
                runtimeErrorFallback: "Failed to process a node...",
                failedProcessFallback: "Failed to process scene...",
                jobStatus: (status: string) => `Scene process status changed to: '${status}'.`,
                nodeStatus: (status: string) => `Node execution status changed to: '${status}'.`,
            },
        },
        command: {
            shortMessage: {
                addNode: "Cmd: Add Node",
                addConn: "Cmd: Add Connection",
                executionStateSync: "Cmd: Sync State",
                getSceneData: "Cmd: Fetch Scene",
                sceneWorker: "Cmd: Worker Action",
                saveScene: "Saved Scene",
                default: (cmdType?: string) => `Cmd: ${cmdType || "Unknown"}`,
            },
            description: {
                addNode: (total: number, requestId: string, statusMessage?: string) =>
                    `Added nodes. Total: ${total}. (request id: ${requestId}) ${statusMessage ?? ""}`.trim(),
                addConn: (total: number, requestId: string, statusMessage?: string) =>
                    `Created connections. Total: ${total}. (request id: ${requestId}) ${statusMessage ?? ""}`.trim(),
                executionStateSync: (mode: string, state: string, statusMessage?: string) =>
                    `Synced execution state. Mode: [${mode}], State: [${state}]. ${statusMessage ?? ""}`.trim(),
                getSceneData: "Fetched scene data from server.",
                sceneWorker: (requestId: string, statusMessage?: string) =>
                    `Processed worker action. (request id: ${requestId}) ${statusMessage ?? ""}`.trim(),
                saveScene: (statusMessage?: string) =>
                    `Saved current scene in the server. ${statusMessage ?? ""}`.trim(),
            },
        },
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
        localServerPanel: {
            serverOutput: "Server Output",
            title: "Local Server Panel",
            serverVersion: "Server Version",
            serverStatus: "Server Status",
            serverState: "Server State",
            starting: "Starting",
            running: "Running",
            stopped: "Stopped",
            disconnected: "Disconnected",
            connecting: "Connecting",
            initializing: "Initializing",
            setting_up: "Setting Up",
            ready: "Ready",
            failed: "Failed",
            stopServer: "Stop Server",
            connectToLocalServer: "Connect to Local Server",
            openPluginsFolder: "Open Plugins Folder",
            restartServer: "Restart Server",
            startLocal: "Start local server",
            startingLocal: "Starting...",
        },
        searchbar: {
            searchPlaceholder: "Search for something here",
            noResultsForQuery: "No results for query",
        },
        login: {
            username: "Username",
            login: "Login",
            logout: "Logout",
            loggedAs: (user: string) => `Logged as '${user}'`
        },
        nodeTypeSelector: {
            nodeTypeFilters: "Nodetype filters",
            messages: {
                noActiveFilters: "No active filters",
            },
            views: {
                active_filters: "Active Filters",   
                tags: "Tags",   
                categories: "Categories",   
            },
            filterTypes: {
                tag: "Tag",
                category: "Category"
            },
            sortModes: {
                id: "ID",
                recent: "Recent"
            },
            displayModes: {
                by_plugin: "By plugin",
                all: "All"
            }
        }
    },
    actions: {
        loadImage: "load image",
        goBack: "Go back",
        continue: "Continue",
        finish: "Finish",
        tryAgain: "Try again",
        cancel: "Cancel",
    },
    messages: {
        mustBeAuthenticated: (action: string) => `You must be authenticated to ${action}`,
        loading: (what?: string) => `Loading ${what}...`,
        isntImplementedYet: (what?: string) => `${what ?? "this"} isn't implemented yet`,
        noImplementationFor: (something: string) => `No implementation for ${something}`,
        errorWhile: (action: string) => `Failed to ${action}`,
        noSomethingSelected: (something: string, fem?: boolean) => `No ${something} selected`,
        couldntFind: (something: string) => `Couldn't find ${something}`,
        noSomethingFound: (something: string) => `No ${something} was found`,
        noConnectionWithServer: "Not connected to a server. Some features might stop working."
    },
    words: {
        unknown: "Unknown",
        documentation: "Documentação",
        description: "Description",
        usages: "Usages",
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
        artifact: "Artifact",
        id: "Id",
        version: "Version",
        index: "Index",
        attributes: "Attributes",
        renderer: "Renderer",
        baseType: "BaseType",
        input: "Input",
        output: "Output",
        undefined: "Undefined",
        min: "Min",
        max: "Max",
        sample: "Sample",
        preview: "Preview",
        widget: "Widget",
        defaultValue: "Default Value",
        tags: "Tags",
        details: "Details",
        note: "Note",
        serverRelease: "Server Release",
        serverVersion: "Server Version",
        engineVersion: "Engine Version",
        state: "State",
        release: "Release",
        preRelease: "Pre Release",
        originalPlugins: "Original Plugins",
        general: "General",
        editor: "Editor",
        localServer: "Local Server",
        remoteServer: "Remote Server",
        filter: (plural?: boolean) => `Filter${plural ? "s" : ""}`,
        category: (plural?: boolean) => `Categor${plural ? "ies" : "y"}`
    }
}