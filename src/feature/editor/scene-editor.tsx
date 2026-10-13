import { KeyEventManager } from "~/utils/input_manager/input-manager";
import { ActionController } from './actions/action-controller';
import { SceneConnectionManager } from "./network/scene-connection-manager";
import { PackageManager } from "./engine/packages/package-manager";
import { NodeScene } from "./engine/node_scene";
import { PackageNodeProvider } from "./engine/providers/package-node-provider";
import { AppSessionManager } from "~/network/app-session-manager";
import { ServerCmdResponseTypes, ServerMessages } from "~/protocols/nodeblocks/network/server-message-protocol";
import { InputEvents, EventHandler } from "~/utils/input_manager/event-handling";
import { ToolController } from "./controllers/tool-controller";
import { SelectionController } from "./canvas/selection-controller";
import { CanvasSpace } from './canvas/editor-space';
import { Grid } from "./components/canvas/grid";
import { Keybind, KeybindMap, MouseButtons } from "~/utils/input_manager/keybind-events";
import { NodeSceneRequestData } from "~/protocols/nodeblocks/network/message/commands/node-graph-commands";
import { nanoid } from "nanoid";
import { RemoveNodesAction } from "./actions/node/remove-nodes-action";

export class SceneEditor {
    private _scene: NodeScene;
    private _inputManager: KeyEventManager
    private _sceneConnection: SceneConnectionManager

    private _actionController: ActionController
    private _selectionController: SelectionController
    private toolController: ToolController

    constructor(
        private _appSession: AppSessionManager,
        private _packageManager: PackageManager
    ) {
        this._inputManager = new KeyEventManager();
        this._scene = new NodeScene(_packageManager.registry, new PackageNodeProvider(_packageManager));
        this._sceneConnection = new SceneConnectionManager(_appSession, _packageManager);

        this._actionController = new ActionController(this._scene, this._sceneConnection);    
        
        this._selectionController = new  SelectionController(
            new CanvasSpace(), new Grid({x: 20, y: 20}),
            this._actionController
        )
        this.toolController = new ToolController(this._selectionController);
        
        // this.toolController.add_tool(new SelectionTool());
        // this.toolController.add_tool(new CommentTool(this.node_editor));
        // this.toolController.add_tool(new DocsTool(this.node_editor));
        
        this._register_handlers();
        this.setup_event_handlers();
        this.setup_keybinds();
    }

    // Getters
    get scene() { return this._scene; }
    get sceneConnection() { return this._sceneConnection; }
    get actionController() { return this._actionController; }

    get appSession() { return this._appSession; }
    get packageManager() { return this._packageManager; }
    get inputManager() { return this._inputManager; }
    get selectionController() { return this._selectionController; }

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
        this.inputManager.set_keybind_handler(
            new Keybind("MainToolAction", [new KeybindMap({mouse_buttons: new Map([[MouseButtons.LEFT, true]])})]),
            {just_activated: (data) => {
                const e = data.event;
                if (e instanceof PointerEvent) {
                    if (e.target !== e.currentTarget) return;
    
                    this.toolController.current_tool?.onPointerDown(e);
                }
            },
            cleanup: (data) => {
                const e = data.event;
                if (e instanceof PointerEvent) {
                    this.toolController.current_tool?.onPointerUp(e);
                    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
                }
            }}
        );
        
        this.inputManager.set_keybind_handler(
            new Keybind("DeleteNode", [new KeybindMap({keys: new Map([["Delete", true]]), modifiers: new Map()})]),
            {just_activated: (data) => {
                if (this.selectionController.selected_nodes.length > 0) {
                    let node_ids: string[] = [];
                    for (const node of this.selectionController.selected_nodes) {
                        node_ids.push(node.uid);
                    }
                    this.actionController.dispatch(
                        new RemoveNodesAction(node_ids)
                    )
                }
            }}
        );
    }
    
    private setup_event_handlers() {
        this._inputManager.set_event_handler(
            InputEvents.CLICK_ON_NODE,
            new EventHandler("onClickOnNode", (data) => {
                if (data.node != null) {
                    this.toolController.current_tool?.onClickOnNode(data.node);
                }
            })
        );

        this._inputManager.set_event_handler(
            InputEvents.CLICK_ON_NODE_SLOT,
            new EventHandler("onClickOnSlot", (data) => {
                if (data.slot) {
                    this.toolController.current_tool?.onClickOnNodeSlot(data.slot);
                }
            })
        );

        this._inputManager.set_event_handler(
            InputEvents.HOVER_NODE,
            new EventHandler("onHoverNode", (data) => {
                if (data.node != null) {
                    this.toolController.current_tool?.onHoverNode(data.node);
                }
            })
        );

        this._inputManager.set_event_handler(
            InputEvents.HOVER_SLOT,
            new EventHandler("onHoverSlot", (data) => {
                if (data.slot) {
                    this.toolController.current_tool?.onHoverSlot(data.slot);
                }
            })
        );

        this._inputManager.set_event_handler(
            InputEvents.HOVER_BACKGROUND,
            new EventHandler("onHoverBackground", (data) => {
                this.toolController.current_tool?.onHoverBackground();
            })
        );
    }
}