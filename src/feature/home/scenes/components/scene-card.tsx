import { ListedScene } from "~/network/api/scene-http-controller"
import PlayIcon from '~/assets/icons/play.svg';
import { useNavigate } from "@solidjs/router";
import { createEffect, createSignal, onMount, Show } from "solid-js";
import { SceneData } from "~/protocols/nodeblocks/manifests/node/node-graph-data";
import { hasPermission, ScenePermission } from "~/network/protocols/scene-perms";
import ToolIcon from '~/assets/icons/tool.svg';
import { SimplifiedScenePreview } from "~/feature/scene/scene-preview";

export const SceneCard = (props: {
    listedScene: ListedScene,
    fetchSceneData?: (sceneId: string) => Promise<SceneData | undefined>,
    editScene: (sceneId: string) => void;
}) => {
    const navigate = useNavigate();
    const openScene = (id: string) => {
        navigate(`/scene/${id}`);
    };
    
    const [sceneData, setSceneData] = createSignal<SceneData | undefined>(undefined);
    createEffect(async () => {
        const sceneId = props.listedScene.uid;
        setSceneData(undefined);

        if (props.fetchSceneData && sceneId) {
            try {
                const scene_data = await props.fetchSceneData(sceneId);
                if (scene_data) {
                    setSceneData(scene_data);
                }
            } catch (error) {
                // Trata o erro 401/Unauthorized de forma silenciosa para não quebrar a UI
                console.warn(`Acesso negado ou erro ao carregar a preview da cena: ${sceneId}`);
            }
        }
    });

    return (
        <div class="scene-card">
            <div class="scene-preview" data-theme="dark">
                <Show when={sceneData()}>
                    {(data) => <SimplifiedScenePreview sceneData={data()}/>}
                    {/* {(data) => <SceneCanvasSetup sceneData={data()} centerCamera={true}/>} */}
                </Show>
            </div>
            <div class="scene-info">
                {/* TODO: adicionar o autor da cena aqui */}
                <div class="user-profile">?</div>
                <div class="container stretch">
                    <span>{props.listedScene.uid}</span>
                </div>
                <div class="scene-actions">
                    <Show when={hasPermission(props.listedScene.user_perms, ScenePermission.ADMIN)}>
                        <button class="icon-button" onclick={() => props.editScene(props.listedScene.uid)}>
                            <ToolIcon class="smaller-icon"/>
                        </button>
                    </Show>
                    <button class="icon-button" onclick={() => openScene(props.listedScene.uid)}>
                        <PlayIcon class="smaller-icon"/>
                    </button>
                </div>
            </div>
        </div>
    )
}
