import { ListedScene, SceneHTTPController } from "~/network/api/scene-http-controller"
import PlayIcon from '~/assets/icons/play.svg';
import { useNavigate } from "@solidjs/router";
import { SceneCanvasSetup } from "~/feature/scene/scene-canvas";
import { createSignal, onMount, Show } from "solid-js";
import { SceneData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";

export const SceneCard = (props: {
    listedScene: ListedScene,
    fetchSceneData?: (sceneId: string) => Promise<SceneData | undefined>
}) => {
    const navigate = useNavigate();
    const openScene = (id: string) => {
        navigate(`/scene/${id}`);
    };
    
    const [sceneData, setSceneData] = createSignal<SceneData | undefined>(undefined);
    onMount(async () => {
        if (props.fetchSceneData) {
            setSceneData(await props.fetchSceneData(props.listedScene.uid));
        }
    });

    return (
        <div class="scene-card">
            <div class="scene-preview" data-theme="dark">
                <Show when={sceneData()}>
                    {(data) => <SceneCanvasSetup sceneData={data()} centerCamera={true}/>}
                </Show>
            </div>
            <div class="scene-info">
                {/* TODO: adicionar o autor da cena aqui */}
                <div class="user-profile">?</div>
                <div class="container stretch">
                    <span>{props.listedScene.uid}</span>
                </div>
                <button class="icon-button" onclick={() => openScene(props.listedScene.uid)}>
                    <PlayIcon class="small-icon"/>
                </button>
            </div>
        </div>
    )
}

// {/* <div class="container">
//     {/* TODO: SCENE CARD */}
//     <div class="keep row-container">
//         <span>{scene.uid}</span>
//         <button onclick={() => openScene(scene.uid)}>
//             Connect
//         </button>
//     </div>
//     <div class="container">
//         <span>Scene Dependencies</span>
//         <ul>
//             <For each={Object.entries(scene.dependencies)}>
//                 {([dependency, version]) => <li>
//                     {dependency}: {version}
//                 </li>}
//             </For>
//         </ul>
//     </div>
// </div>} */}