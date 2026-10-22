import { createSignal, createMemo, mapArray, Show, For } from "solid-js";
import { useScene } from "~/feature/scene/scene-context";
import { Vector2 } from "~/protocols/nodeblocks/geometry";
import { NodeTypeSpec } from "~/protocols/nodeblocks/manifests/node/node-spec";
import { useEditor } from "~/feature/scene-editor-context";
import { NodePreview } from "~/feature/scene/components/node/node-component";


export const NodeTypeSelector = (props: {
    onClickOnPreview: (node_preview: NodeTypePreview) => void
}) => {
    const scene = useScene();
    // const [categoryFilter, setCategoryFilter] = createSignal<string | undefined>(undefined);
    const specs = createMemo(() => {
        // TODO: usar o packageManager e as dependências da cena para
        // passar os specs dos nodes
        return Object.values(scene.scene.registry.nodeTypes);
    });

    // const categories = createMemo(() => {
    //     let category_index = new Map<string, NodeCategory>()
    //     constructors().forEach((constructor) => {
    //         const node_meta = metadata.get_node_meta(constructor.type_id, constructor.root_id);
    //         if (node_meta?.category) {
    //             if (typeof node_meta.category == "string") {
    //                 return;
    //             }

    //             category_index.set(
    //                 node_meta.category.category_id,
    //                 node_meta.category
    //             )
    //         }
    //     });

    //     return category_index;
    // });
    
    const node_previews = mapArray(specs, (spec) => {
        return new NodeTypePreview(spec);
    });
    // const filtered_previews = createMemo(() => {
    //     return node_previews().filter((preview) => {
    //         const category = metadata.get_node_meta(preview.node_constructor.type_id, preview.node_constructor.root_id)?.category;
    //         if (typeof category == "string") {
    //             return false;
    //         }
    //         return categoryFilter() === undefined || category?.category_id == categoryFilter()
    //     })
    // })

    return (
        <div class="container" style={{
            "overflow-x": "hidden",
            width: "auto"
        }}>
            {/* <div class="container fill" style={{color: "white"}}>
                <div class="keep row-container">
                    <h3>Categories</h3>
                </div>
                <div class="keep row-container scrollable" style={{width: "auto"}}>
                    <For each={categories().entries().toArray()}>
                        {([name, category]) => {
                            return <button 
                                class="selectable-button"
                                classList={{"active": categoryFilter() == name}}
                                onclick={() => setCategoryFilter(name)}
                            >
                                {name}
                            </button>
                        }}
                    </For>
                </div>
            </div> */}
            {/* <div class="keep fill row-container space-between" style={{"align-items": "center"}}>
                <h3>
                    {categoryFilter() ?? "All"} Nodes
                </h3>
                <Show when={categoryFilter() != undefined}>
                    <button class="icon-button" onclick={() => setCategoryFilter(undefined)}>
                        <CloseIcon />
                    </button>
                </Show>
            </div> */}
            <div class="node-type-selector">
                <For each={node_previews()}>
                    {(item) => item.View(props.onClickOnPreview)}
                </For>
            </div>
        </div>
    );
}


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
    set selected(value: boolean) { this._set_selected(value) }

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
                    <NodePreview spec={this._spec}/>
                </div>
            </div>
        );
    };
}


export const SelectedNodeType = (props: {
    node_pos: Vector2, 
}) => {
    const editor = useEditor();
    const PreviewComponent = () => {
        if (!editor.selectionController.selected_node_type) {
            return null;
        }
        const spec = editor.packageManager.registry.getNodeTypeSpec(editor.selectionController.selected_node_type);
        return <NodePreview spec={spec}/>
    }

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
    )
}