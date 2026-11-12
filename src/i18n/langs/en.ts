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
                noTopicFound: "No topic found",
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
            editor: {
                theme: "Theme",
                lang: "Language",
                alwaysShowSlotLabels: "Always Show Slot Labels"
            },
            setupWizard: {
                finishSetup: "Finish Setup",
                serverOutput: "Server Output",
                messages: {
                    alreadyConnected: (http: string) => `you are already connected to: ${http}`
                },
                start: {
                    title: "How would you like to run nodeblocks?",
                    description: "You can install the server and run it locally or connect to a remote server.",
                    installLocally: "Install server locally",
                    connectToRemote: "Connect to a remote server"
                },
                install: {
                    title: "Nodeblocks Setup",
                    setupInfo: "To run nodeblocks server locally, this installer will download its runtime",
                    setupInfo1: "This needs an internet connection and might take a few minutes.",
                    install: "Install",
                    messages: {
                        alreadyInstalled: "Nodeblocks is already installed.",
                        installedSuccessfully: "Nodeblocks was installed successfully.",
                        checkingInstallation: "Checking installation...",
                        installFailed: "The installation failed.",
                    }
                }
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
        login: {
            username: "Username",
            login: "Login",
            logout: "Logout"
        }
    },
    actions: {
        loadImage: "load image",
        goBack: "Go back",
        tryAgain: "Try again",
    },
    messages: {
        mustBeAuthenticated: (action: string) => `You must be authenticated to ${action}`,
        loading: (what?: string) => `Loading ${what}...`,
        isntImplementedYet: (what?: string) => `${what ?? "this"} isn't implemented yet`,
        noImplementationFor: (something: string) => `No implementation for ${something}`,
        errorWhile: (action: string) => `Failed to ${action}`,
        noSomethingSelected: (something: string, fem?: boolean) => `No ${something} selected`,
        couldntFind: (something: string) => `Couldn't find ${something}`
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
    }
}