import { SelectionController } from "../canvas/selection-controller";
import { ContextMenuItem } from "~/feature/context-menu/context-menu-protocol";
import { ActionController } from "~/feature/editor/actions/action-controller";
import { RemoveNodesAction } from "~/feature/editor/actions/node/remove-nodes-action";
import { StateController } from "~/feature/editor/controllers/state-controller";
import { InputManager } from "~/utils/keybinds/input-manager";

export class CanvasContextMenuController {

    constructor(
        private readonly selectionController: SelectionController,
        private readonly actionController: ActionController,
        private readonly stateController: StateController,
        private readonly inputManager: InputManager
    ) {

    }

    get contextItems() { 
        const items: ContextMenuItem[] = [];
        if (this.selectionController.selected_nodes.length > 0) {
            const nodeCount = this.selectionController.selected_nodes.length;
            const nodeCountString = (nodeCount != 1 ? `(${nodeCount})` : "");
            
            let nodeIds: string[] = [];
            this.selectionController.selected_nodes.forEach((node) => nodeIds.push(node.uid));
            
            items.push({
                id: "target",
                label: "Mark as target" + nodeCountString,
                action: () => {
                    this.stateController.requestUpdateTargetNodes(nodeIds)
                }
            });
            items.push({
                id: "del", 
                label: "Delete" + nodeCountString, 
                shortcut: this.inputManager.getActiveContext()?.getFirstKeybindTrigger("DeleteNode")?.toStr(),
                action: () => {this.actionController.dispatch(
                    new RemoveNodesAction(nodeIds)
                )}
            });
        } else {
            items.push({
                id: "target",
                label: "Clear targets",
                action: () => {
                    this.stateController.requestUpdateTargetNodes([])
                }
            })
        }
        return items;
    }
}