import { createSignal, Show } from "solid-js";
import { useEditor } from "~/feature/editor/contexts/scene-editor-context";
import { NodePreview } from "~/feature/scene/components/node/node-previews";
import { Vector2 } from "~/protocols/nodeblocks/geometry";
import { NodeTypeSpec } from "~/protocols/nodeblocks/manifests/node/node-spec";


export class NodeTypePreview {
    private _set_selected: (v: boolean) => void;
    private _selected: () => boolean;

    constructor(
        private readonly _spec: NodeTypeSpec
    ) {
        [this._selected, this._set_selected] = createSignal(false);
    }

    get nodetype() { return this._spec.fqn; }
    get spec() { return this._spec; }
    set selected(value: boolean) { this._set_selected(value); }

    public View(onPointerDown: (node_preview: NodeTypePreview) => void) {
        return (
            <div
                has-docs={true}
                onPointerDown={() => onPointerDown(this)}
                class="node-type-preview"
                classList={{
                    "selected-node-type": this._selected()
                }}
                style={{
                    cursor: "pointer"
                }}
            >
                <div class="remove-input">
                    <NodePreview spec={this._spec} />
                </div>
            </div>
        );
    };
}
export const SelectedNodeType = (props: {
    node_pos: Vector2;
}) => {
    const editor = useEditor();
    const PreviewComponent = () => {
        if (!editor.selectionController.selected_node_type) {
            return null;
        }
        const spec = editor.packageManager.registry.getNodeTypeSpec(editor.selectionController.selected_node_type);
        return <NodePreview spec={spec} />;
    };

    return (
        <Show when={PreviewComponent()}>
            <div
                class="selected-type-preview"
                style={{
                    position: "absolute",
                    transform: `translate(${props.node_pos.x}px, ${props.node_pos.y}px)`,
                    "pointer-events": "none"
                }}
            >
                {PreviewComponent()}
            </div>
        </Show>
    );
};

