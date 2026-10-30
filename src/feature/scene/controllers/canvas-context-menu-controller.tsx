import { SelectionController } from "../canvas/selection-controller";
import { ContextMenuItem } from "~/feature/context-menu/context-menu-protocol";
import { ActionController } from "~/feature/editor/actions/action-controller";
import { RemoveNodesAction } from "~/feature/editor/actions/node/remove-nodes-action";
import { StateController } from "~/feature/editor/controllers/state-controller";
import { InputManager } from "~/utils/keybinds/input-manager";
import { SceneConnectionManager } from "~/feature/editor/network/scene-connection-manager";
import { ClientSceneCommandTypes, CommandGroups } from "~/protocols/nodeblocks/network/client-command-protocol";
import { nanoid } from "nanoid";

export class CanvasContextMenuController {

    constructor(
        private readonly selectionController: SelectionController,
        private readonly actionController: ActionController,
        private readonly stateController: StateController,
        private readonly sceneConnection: SceneConnectionManager,
        private readonly inputManager: InputManager
    ) {

    }

    get contextItems() { 
        const items: ContextMenuItem[] = [];
        items.push({
            id: "refresh",
            label: "Refresh",
            action: () => {
                this.sceneConnection.sendCommand({
                    cmd_uid: nanoid(5),
                    cmd_group: CommandGroups.SCENE,
                    type: ClientSceneCommandTypes.GET_SCENE_DATA
                })
            }
        });

        if (this.selectionController.selected_nodes.length > 0) {
            const nodeCount = this.selectionController.selected_nodes.length;
            const nodeCountString = (nodeCount != 1 ? `(${nodeCount})` : "");
            
            let nodeIds: string[] = [];
            this.selectionController.selected_nodes.forEach((node) => nodeIds.push(node.uid));
            // TODO: mark dependencies as target
            items.push({
                id: "target",
                label: "Mark as target" + nodeCountString,
                action: () => {
                    if (this.inputManager.getKeybindState("MultipleMod")) {
                        this.stateController.requestUpdateTargetNodes(
                            this.stateController.target_nodes?.concat(
                                nodeIds.filter((id) => !this.stateController.target_nodes?.includes(id))
                            ) ?? []
                        )
                        return;
                    }
                    this.stateController.requestUpdateTargetNodes(nodeIds)
                }
            });
            
            let targetedCount = 0;
            nodeIds.forEach((id) => {
                if (this.stateController.isNodeTargeted(id)) {
                    targetedCount += 1
                }
            });
            if (targetedCount > 0) {
                items.push({
                    id: "detarget",
                    label: "Unmark Targeted" + (targetedCount != 1 ? `(${targetedCount})` : ""),
                    action: () => {
                        this.stateController.requestUpdateTargetNodes(
                            this.stateController.target_nodes?.filter((id) => !nodeIds.includes(id))
                            ?? []
                        )
                    }
                });
            }

            items.push({
                id: "del", 
                label: "Delete" + nodeCountString, 
                shortcut: this.inputManager.getActiveContext()?.getFirstKeybindTrigger("DeleteNode")?.toStr(),
                action: () => {this.actionController.dispatch(
                    new RemoveNodesAction(nodeIds)
                )}
            });
        } else {
            if (this.stateController.hasNodeTargets()) {
                items.push({
                    id: "target",
                    label: "Clear targets",
                    action: () => {
                        this.stateController.requestUpdateTargetNodes([])
                    }
                });
            }
        }
        return items;
    }
}