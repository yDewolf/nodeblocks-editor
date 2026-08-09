import { createMemo, createSignal, For, mapArray, Show } from "solid-js";
import { SceneController } from "~/wrapper/controllers/scene-controller";
import { CustomNodeConstructor } from "~/wrapper/helpers/node-constructor";
import { NodePreview } from "../../editor/components/node/node-component";
import CloseIcon from "~/assets/icons/close.svg";
import { Vector2 } from "~/wrapper/data_types/geometry";
import { EditorTool } from "~/editor/tools/base-tool";
import { SelectionTool } from "~/editor/tools/selection-tool";
import { SelectionController } from "~/editor/controllers/selection-controller";
import { SelectionRect } from '../../editor/components/misc/selection_rect';

export class NodeTypeSelector {
    public View(scene_controller: SceneController, onClickOnPreview: (node_preview: NodeTypePreview) => void) {
        const [categoryFilter, setCategoryFilter] = createSignal<string | undefined>(undefined);
        const constructors = createMemo(() => {
            scene_controller.node_type_reader.keep_track();
            return Array.from(scene_controller.node_type_reader.node_constructors.values());
        });

        // const categories = createMemo(() => {
        //     let category_index = new Map<string, NodeCategory>()
        //     constructors().forEach((constructor) => {
        //         category_index.set(
        //             constructor._metadata.category.name,
        //             constructor._metadata.category
        //         )
        //     });

        //     return category_index;
        // });
        
        const node_previews = mapArray(constructors, (constructor) => {
            return new NodeTypePreview(constructor);
        });
        // const filtered_previews = createMemo(() => {
        //     return node_previews().filter((preview) => categoryFilter() === undefined || preview.node_constructor._metadata.category.name == categoryFilter())
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
                <div class="keep fill row-container space-between" style={{"align-items": "center"}}>
                    <h3>
                        {categoryFilter() ?? "All"} Nodes
                    </h3>
                    <Show when={categoryFilter() != undefined}>
                        <button class="icon-button" onclick={() => setCategoryFilter(undefined)}>
                            <CloseIcon />
                        </button>
                    </Show>
                </div>
                <div class="node-type-selector">
                    <For each={node_previews()}>
                        {(item) => item.View(onClickOnPreview)}
                    </For>
                </div>
            </div>
        );
    }
}


export class NodeTypePreview {
    node_constructor: CustomNodeConstructor
    private _set_selected: (v: boolean) => void;
    private _selected: () => boolean;

    constructor(node_constructor: CustomNodeConstructor) {
        this.node_constructor = node_constructor;
        
        const [selected, setSelected] = createSignal(false);
        this._set_selected = setSelected;
        this._selected = selected;
    }

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
                    <NodePreview constructor={this.node_constructor}/>
                </div>
            </div>
        );
    };
}


export const SelectedNodeType = (props: {world_mouse_pos: Vector2, scene_controller: SceneController, selection_controller: SelectionController}) => {
    const node_constructor = createMemo(() => {
        const node_type = props.selection_controller.selected_node_type;
        if (!node_type) {
            return undefined;
        }
        
        return props.scene_controller.node_controller.node_constructors.get(node_type);
    });
    const PreviewComponent = () => {
        const constructor = node_constructor();
        if (constructor) {
            return <NodePreview constructor={constructor}/>
        }

        return undefined
    }

    return (
        <Show when={PreviewComponent()}>
            <div
                class="selected-type-preview"
                style={{
                    position: "absolute",
                    transform: `translate(${props.world_mouse_pos.x}px, ${props.world_mouse_pos.y}px)`,
                    "pointer-events": "none"
                }}
            >
                {PreviewComponent()}
            </div>
        </Show>
    )
}