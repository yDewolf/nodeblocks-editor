import { BaseNode } from '~/components/nodes/base-node';
import { Vector2 } from '~/data_types/geometry';
import { EditorTool } from './base-tool';

export class ConnectionTool implements EditorTool {
    onKeyDown(e: KeyboardEvent): void {

    }
    
    onKeyUp(e: KeyboardEvent): void {
    }

    onWheel(e: WheelEvent): void {
    }

    onPointerDown(e: PointerEvent): void {
    }

    onPointerUp(e: PointerEvent): void {
    }

    onClickOnNode(node: BaseNode): void {
    }

    onMoveCursor(pos: Vector2, delta: Vector2, all_nodes: BaseNode[]): void {
    }

}