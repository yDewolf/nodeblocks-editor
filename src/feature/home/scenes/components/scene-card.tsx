import { ListedScene, SceneHTTPController } from "~/network/api/scene-http-controller"
import PlayIcon from '~/assets/icons/play.svg';
import { useNavigate } from "@solidjs/router";

export const SceneCard = (props: {
    listedScene: ListedScene,
}) => {
    const navigate = useNavigate();

    const openScene = (id: string) => {
        navigate(`/scene/${id}`);
    };
    return (
        <div class="scene-card">
            <div class="scene-preview">
                
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