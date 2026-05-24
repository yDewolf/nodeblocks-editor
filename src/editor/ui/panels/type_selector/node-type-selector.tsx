import { createMemo, createSignal, For, mapArray, Show } from "solid-js";
import { NodePreview } from "./node-preview";
import { SceneController } from "~/wrapper/controllers/scene-controller";
import { NodeCategory } from "~/wrapper/nodes/data/node-metadata";

export class NodeTypeSelector {
    public View(scene_controller: SceneController, onClickOnPreview: (node_preview: NodePreview) => void) {
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
            return new NodePreview(constructor);
        });
        // const filtered_previews = createMemo(() => {
        //     return node_previews().filter((preview) => categoryFilter() === undefined || preview.node_constructor._metadata.category.name == categoryFilter())
        // })

        return (
            <div class="container padded" style={{
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
                    <h3 style={{color: "white"}}>
                        {categoryFilter() ?? "All"} Nodes
                    </h3>
                    <Show when={categoryFilter() != undefined}>
                        <button class="icon-button" onclick={() => setCategoryFilter(undefined)}>
                            <img src="public/assets/icons/close.svg" />
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