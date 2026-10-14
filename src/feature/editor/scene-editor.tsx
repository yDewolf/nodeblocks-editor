import { ActionController } from './actions/action-controller';
import { SceneConnectionManager } from "./network/scene-connection-manager";
import { PackageManager } from "./engine/packages/package-manager";
import { NodeScene } from "./engine/node_scene";
import { PackageNodeProvider } from "./engine/providers/package-node-provider";
import { AppSessionManager } from "~/network/app-session-manager";
import { ServerCmdResponseTypes, ServerMessages } from "~/protocols/nodeblocks/network/server-message-protocol";
import { InputEvents, EventHandler } from "~/utils/events/event-handling";
import { ToolController } from "./controllers/tool-controller";
import { SelectionController } from "./canvas/selection-controller";
import { CanvasSpace } from './canvas/editor-space';
import { RemoveNodesAction } from "./actions/node/remove-nodes-action";
import { InputManager } from '~/utils/keybinds/input-manager';
import { EventManager } from '~/utils/events/event-manager';
import { KeybindTrigger, MouseButtons } from '~/utils/keybinds/keybind-trigger';
import { InputContext } from '~/utils/keybinds/input-context';
import { SelectionTool } from './tools/selection-tool';
import { CanvasElementController } from '../scene/controllers/canvas-element-controller';
import { StateController } from './controllers/state_controller';

export class SceneEditor {
    private _scene: NodeScene;

    private _globalInputContext: InputContext;
    private _inputManager: InputManager;
    private _eventManager: EventManager;

    private _sceneConnection: SceneConnectionManager;
    private _stateController: StateController;

    private _elementController: CanvasElementController;

    private _actionController: ActionController;
    private _selectionController: SelectionController;
    private _toolController: ToolController;

    constructor(
        private _appSession: AppSessionManager,
        private _packageManager: PackageManager
    ) {
        this._globalInputContext = new InputContext("global");
        this._inputManager = new InputManager();
        this._eventManager = new EventManager();

        this._scene = new NodeScene(_packageManager.registry, new PackageNodeProvider(_packageManager));
        this._sceneConnection = new SceneConnectionManager(_appSession, _packageManager);
        this._stateController = new StateController(this._sceneConnection);

        this._actionController = new ActionController(this._scene, this._sceneConnection);    
        this._selectionController = new  SelectionController(
            new CanvasSpace(),
            this._actionController
        )
        
        this._elementController = new CanvasElementController(this._scene, this.grid);

        this._register_handlers();
        this.setup_event_handlers();
        this.setup_keybinds();
        
        // this.toolController.add_tool(new CommentTool(this.node_editor));
        // this.toolController.add_tool(new DocsTool(this.node_editor));
        this._toolController = new ToolController(this.globalInputContext);
        this._toolController.add_tool(new SelectionTool(this.scene, this.actionController, this.selectionController, this._elementController));
        this._toolController.change_tool(0)
    }

    // Getters
    get scene() { return this._scene; }
    get sceneConnection() { return this._sceneConnection; }
    get stateController() { return this._stateController; }
    get actionController() { return this._actionController; }

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
        await this._sceneConnection.connect(scene_uid);
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
        this._globalInputContext.bind(
            "MainToolAction", 
            new KeybindTrigger({mouseButtons: [MouseButtons.Left]}),
            {just_activated: (e) => {
                if (e instanceof PointerEvent) {
                    if (e.target !== e.currentTarget) return;
    
                    this._toolController.current_tool?.onPointerDown(e);
                }
            },
            just_released: (e) => {
                if (e instanceof PointerEvent) {
                    this._toolController.current_tool?.onPointerUp(e);
                    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
                }
            }
        })
        this._globalInputContext.bind(
            "SecondaryToolAction",
            new KeybindTrigger({mouseButtons: [MouseButtons.Right]}),
            {}
        )

        this._globalInputContext.bind("DeleteNode", 
            new KeybindTrigger({keys: ["Delete"]}),
            {just_activated: (e) => {
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
    }
    
    private setup_event_handlers() {
        this._eventManager.addEventHandler(
            InputEvents.CLICK_ON_NODE,
            new EventHandler("onClickOnNode", (data) => {
                if (data.node != null) {
                    this._toolController.current_tool?.onClickOnNode(data.node);
                }
            })
        );

        this._eventManager.addEventHandler(
            InputEvents.CLICK_ON_NODE_SLOT,
            new EventHandler("onClickOnSlot", (data) => {
                if (data.slot) {
                    this._toolController.current_tool?.onClickOnNodeSlot(data.slot);
                }
            })
        );

        this._eventManager.addEventHandler(
            InputEvents.HOVER_NODE,
            new EventHandler("onHoverNode", (data) => {
                if (data.node != null) {
                    this._toolController.current_tool?.onHoverNode(data.node);
                }
            })
        );

        this._eventManager.addEventHandler(
            InputEvents.HOVER_SLOT,
            new EventHandler("onHoverSlot", (data) => {
                if (data.slot) {
                    this._toolController.current_tool?.onHoverSlot(data.slot);
                }
            })
        );

        this._eventManager.addEventHandler(
            InputEvents.HOVER_BACKGROUND,
            new EventHandler("onHoverBackground", (data) => {
                this._toolController.current_tool?.onHoverBackground();
            })
        );

        this._eventManager.addEventHandler(
            InputEvents.POINTER_MOVING,
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