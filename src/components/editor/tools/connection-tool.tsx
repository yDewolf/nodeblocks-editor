import { BaseNode } from '~/components/nodes/base-node';
import { BaseEditorTool } from './base-tool';
import { NodeSlot } from '~/components/nodes/slot/node-slot';
import { ConnectionController } from '../controllers/connection-controller';
import { NodeEditor } from '../node-editor';

export class ConnectionTool extends BaseEditorTool {
    connection_controller: ConnectionController;

    constructor(node_editor: NodeEditor) {
        super(node_editor);
        this.connection_controller = node_editor.connection_controller;
    }

    onClickOnNode(node: BaseNode): void {
    
    }
    
    onClickOnNodeSlot(slot: NodeSlot): void {
        this.connection_controller.select_slot(slot);
    }
}