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

        const categories = createMemo(() => {
            let category_index = new Map<string, NodeCategory>()
            constructors().forEach((constructor) => {
                category_index.set(
                    constructor._metadata.category.name,
                    constructor._metadata.category
                )
            });

            return category_index;
        });
        
        const node_previews = mapArray(constructors, (constructor) => {
            return new NodePreview(constructor);
        });
        const filtered_previews = createMemo(() => {
            return node_previews().filter((preview) => categoryFilter() === undefined || preview.node_constructor._metadata.category.name == categoryFilter())
        })

        return (
            <div class="container node-type-selector" style={{
                width: "100%"
            }}>
                <div class="keep fill row-container">
                    <For each={categories().entries().toArray()}>
                        {([name, category]) => {
                            return <button onclick={() => setCategoryFilter(name)}>
                                {name}
                            </button>
                        }}
                    </For>
                </div>
                <div class="keep fill row-container">
                    <Show when={categoryFilter() != undefined}>
                        <button onclick={() => setCategoryFilter(undefined)}>
                            x
                        </button>
                    </Show>
                    {categoryFilter() ?? "All"} Nodes
                </div>
                <div class="node-type-selector">
                    <For each={filtered_previews()}>
                        {(item) => item.View(onClickOnPreview)}
                    </For>
                </div>
            </div>
        );
    }
}