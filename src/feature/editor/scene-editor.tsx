import { ActionController } from './actions/action-controller';
import { SceneConnectionManager } from "./network/scene-connection-manager";
import { PackageManager } from "./engine/packages/package-manager";
import { NodeScene } from "./engine/node_scene";
import { PackageNodeProvider } from "./engine/providers/package-node-provider";
import { AppSessionManager } from "~/network/app-session-manager";
import { ServerCmdResponseTypes } from "~/protocols/nodeblocks/network/server-message-protocol";
import { InputEvents, EventHandler } from "~/utils/events/event-handling";
import { ToolController } from "./controllers/tool-controller";
import { SelectionController } from "../scene/canvas/selection-controller";
import { CanvasSpace } from '../scene/canvas/editor-space';
import { RemoveNodesAction } from "./actions/node/remove-nodes-action";
import { InputManager } from '~/utils/keybinds/input-manager';
import { EventManager } from '~/utils/events/event-manager';
import { KeybindTrigger, MouseButton } from '~/utils/keybinds/keybind-trigger';
import { InputContext } from '~/utils/keybinds/input-context';
import { SelectionTool } from './tools/selection-tool';
import { CanvasElementController } from '../scene/controllers/canvas-element-controller';
import { SceneRuntimeController } from '../scene/controllers/scene-runtime-controller';
import { NotificationController } from './controllers/notification/notification-controller';
import { MetadataController } from '../metadata/metadata_controller';
import { DocsTool } from './tools/docs-tool';
import { DocsController } from '../docs/docs-controller';
import { nanoid } from 'nanoid';
import { ClientSceneCommandTypes, CommandGroups } from '~/protocols/nodeblocks/network/client-command-protocol';
import { SceneExecutionCmdTypes } from '../../protocols/nodeblocks/network/client-command-protocol';
import { createSceneState, editorState } from './editor-state';

export class SceneEditor {
    private _scene: NodeScene;

    private _globalInputContext: InputContext;
    private _inputManager: InputManager;
    private _eventManager: EventManager;

    private _sceneConnection: SceneConnectionManager;

    private _elementController: CanvasElementController;
    private _runtimeController: SceneRuntimeController;

    private _actionController: ActionController;
    private _selectionController: SelectionController;
    private _toolController: ToolController;

    private _notificationController: NotificationController;
    private _metadataController: MetadataController;
    private _docsController: DocsController;

    constructor(
        private _appSession: AppSessionManager,
        private _packageManager: PackageManager,
        private readonly sceneId: string
    ) {
        this._globalInputContext = new InputContext("global");
        this._inputManager = new InputManager();
        this._eventManager = new EventManager();

        this._scene = new NodeScene(_packageManager.registry, new PackageNodeProvider(_packageManager), this.sceneId);
        this._sceneConnection = new SceneConnectionManager(_appSession, _packageManager);
        this._sceneConnection.onConnect(this.onSceneConnect.bind(this));

        this._actionController = new ActionController(this._scene, this._sceneConnection);    
        this._selectionController = new  SelectionController(
            new CanvasSpace(),
            this._actionController,
            this._inputManager
        )
        
        this._elementController = new CanvasElementController(this._scene, this.grid);
        this._runtimeController = new SceneRuntimeController(this.sceneConnection, this.elementController);
        this._notificationController = new NotificationController(this.sceneConnection, this.elementController);

        this._metadataController = new MetadataController(this.appSession, this.packageManager);
        this._docsController= new DocsController(this.metadataController);

        this._register_handlers();
        this.setup_event_handlers();
        this.setup_keybinds();
        
        // this.toolController.add_tool(new CommentTool(this.node_editor));
        this._toolController = new ToolController(this.globalInputContext);
        this._toolController.add_tool(new SelectionTool(this.scene, this.actionController, this.selectionController, this._elementController, this._inputManager));
        this.toolController.add_tool(new DocsTool(this.docsController));
        this._toolController.change_tool(0);
    }

    // Getters
    get scene() { return this._scene; }
    get sceneConnection() { return this._sceneConnection; }
    get stateController() { return this._runtimeController.stateController; }
    get actionController() { return this._actionController; }
    get runtimeController() { return this._runtimeController; }

    get notificationController() { return this._notificationController; }
    get metadataController() { return this._metadataController; }
    get docsController() { return this._docsController; }

    get appSession() { return this._appSession; }
    get packageManager() { return this._packageManager; }
    
    get inputManager() { return this._inputManager; }
    get globalInputContext() { return this._globalInputContext; }
    get eventManager() { return this._eventManager; }
    
    get toolController() { return this._toolController; }

    get selectionController() { return this._selectionController; }
    get elementController() { return this._elementController; }

    get  grid() { return this._selectionController.grid; }

    // Methods

    public async connectToScene(scene_uid: string) {
        this.stateController.setIsLoadingScene(true);
        await this._sceneConnection.connect(scene_uid);
    }

    protected onSceneConnect(connection: SceneConnectionManager) {
        connection.sendCommand({
            cmd_uid: nanoid(5),
            cmd_group: CommandGroups.SCENE,
            type: ClientSceneCommandTypes.GET_SCENE_DATA
        });
        connection.sendCommand({
            cmd_uid: nanoid(5),
            cmd_group: CommandGroups.EXECUTION,
            type: SceneExecutionCmdTypes.CHECK_EXECUTION_STATE
        });

        const space = this.selectionController.space;
        if (connection.sceneId) {
            if (!(connection.sceneId in editorState.scenes)) {
                createSceneState(connection.sceneId);
            }
            space.camera.updateOffset(
                editorState.scenes[connection.sceneId]?.mainCameraPos
                ?? {x: 0, y: 0}
            );
            space.camera.zoom = editorState.scenes[connection.sceneId]?.mainCameraZoom ?? 1.0;
        }
    }

    // Scene Events
    
    private _register_handlers() {
        this._sceneConnection.onCommandResponse(ServerCmdResponseTypes.GET_SCENE_DATA, (msg) => {
            if (msg.response_payload.scene_data) {
                this._scene.loadFromSceneData(msg.response_payload.scene_data);
            }
        });
    }

    // Input Events

    private setup_keybinds() {
        this._globalInputContext.bind("MultipleMod",
            new KeybindTrigger({modifiers: {shift: true}}),
            {}
        )

        this._globalInputContext.bind("MainToolAction", 
            new KeybindTrigger({mouseButtons: [MouseButton.Left], modifiers: {any: true}}),
            {handle_just_activated: (event) => {
                const e = event.nativeEvent;
                if (e instanceof PointerEvent && !e.defaultPrevented) {
                    // if (e.target !== e.currentTarget) return;
                    this._toolController.current_tool?.onPointerDown(e);
                }
            },
            handle_just_released: (event) => {
                const e = event.nativeEvent;
                if (e instanceof PointerEvent && !e.defaultPrevented) {
                    this._toolController.current_tool?.onPointerUp(e);
                    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
                }
            }
        })
        this._globalInputContext.bind("SecondaryToolAction",
            [
            new KeybindTrigger({mouseButtons: [MouseButton.Right]}),
            new KeybindTrigger({mouseButtons: [MouseButton.Right], modifiers: {any: true}}),
            ],
            {}
        )

        this._globalInputContext.bind("DeleteNode", 
            new KeybindTrigger({keys: ["Delete"]}),
            {handle_just_activated: (e) => {
                if (this.selectionController.selected_nodes.length > 0) {
                    let node_ids: string[] = [];
                    for (const node of this.selectionController.selected_nodes) {
                        node_ids.push(node.uid);
                    }
                    this.actionController.dispatch(
                        new RemoveNodesAction(node_ids)
                    )
                }
            }
        })

        this._globalInputContext.bind("Save",
            new KeybindTrigger({keys: ["KeyS"], modifiers: { ctrl: true }}),
            {handle_just_activated: (e) => {
                e.nativeEvent.preventDefault();
                this.sceneConnection.sendCommand({
                    cmd_uid: nanoid(),
                    cmd_group: CommandGroups.SCENE,
                    type: ClientSceneCommandTypes.SAVE_SCENE
                })
            }}
        )
    }
    
    private setup_event_handlers() {
        this._eventManager.setEventHandler(
            InputEvents.CLICK_ON_NODE,
            "EditorClickOnNode",
            new EventHandler("onClickOnNode", (data) => {
                if (data.event instanceof PointerEvent) {
                    this.inputManager.onPointerDown(data.event, true);
                }
                if (data.node != null) {
                    this._toolController.current_tool?.onClickOnNode(data.node);
                }
                data.event?.preventDefault();
            })
        );

        this._eventManager.setEventHandler(
            InputEvents.CLICK_ON_NODE_SLOT,
            "EditorClickOnSlot",
            new EventHandler("onClickOnSlot", (data) => {
                if (data.event instanceof PointerEvent) {
                    this.inputManager.onPointerDown(data.event, true);
                }
                if (data.slot) {
                    this._toolController.current_tool?.onClickOnNodeSlot(data.slot);
                }
                data.event?.preventDefault();
            })
        );

        this._eventManager.setEventHandler(
            InputEvents.HOVER_NODE,
            "EditorHoverNode",
            new EventHandler("onHoverNode", (data) => {
                if (data.node != null) {
                    this._toolController.current_tool?.onHoverNode(data.node);
                }
            })
        );

        this._eventManager.setEventHandler(
            InputEvents.HOVER_SLOT,
            "EditorHoverSlot",
            new EventHandler("onHoverSlot", (data) => {
                if (data.slot) {
                    this._toolController.current_tool?.onHoverSlot(data.slot);
                }
            })
        );

        this._eventManager.setEventHandler(
            InputEvents.HOVER_BACKGROUND,
            "EditorHoverBackround",
            new EventHandler("onHoverBackground", (data) => {
                this._toolController.current_tool?.onHoverBackground();
            })
        );

        this._eventManager.setEventHandler(
            InputEvents.POINTER_MOVING,
            "EditorPointerMoving",
            new EventHandler("onPointerMoving", (data) => {
                const e = data.event;
                if (e instanceof PointerEvent) {
                    const [screen_pos, world_pos] = this.selectionController.space.get_cursor_pos(e)
                    this.selectionController.space.cursorWorldPos = world_pos;

                    this._toolController.current_tool?.onMoveCursor(world_pos, {x: e.movementX, y: e.movementY}, Object.values(this.elementController.nodes));
                }
            })
        )
    }
}