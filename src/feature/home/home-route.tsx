import { createSignal, For, onMount, Show } from "solid-js";
import { SceneHTTPController } from "~/network/api/scene-http-controller";
import { useAppSession } from "~/network/app-session-provider"
import { UserSessionData } from "~/network/protocols/user-session";
import RefreshIcon from '~/assets/icons/refresh.svg';
import { useNavigate } from "@solidjs/router";

export function Home() {
    const appSession = useAppSession();
    const [userId, setUserId] = createSignal<string>("");

    const [isMounted, setIsMounted] = createSignal(false);
    onMount(() => {
        setIsMounted(true);
    });

    return (
        <div>
            <Show when={isMounted()}>
                <Show when={appSession.userSession} fallback={
                    <div>
                        <input type="text" oninput={(e) => {
                            setUserId(e.target.value)
                        }} />
                        <button onclick={() => appSession.login(userId())}>Login</button>
                    </div>
                }>
                    {(sessionData) => {
                        const session = sessionData();
                        return (
                            <>
                                Authenticated as {session.user_id}
                                <SceneGrid sessionData={session}/>
                            </>
                        )
                    }}
                </Show>
            </Show>
        </div>
    )
}

const SceneGrid = (props: {sessionData: UserSessionData}) => {
    const appSession = useAppSession();
    const sceneController = new SceneHTTPController(appSession);
    const [targetScene, setTargetScene] = createSignal<string>("");

    const navigate = useNavigate();
    const openScene = (id: string) => {
        navigate(`/scene/${id}`);
    };

    onMount(() => {
        sceneController.fetchScenes(props.sessionData.user_id);
    })

    return (
        <div class="container">
            <div class="keep row-container fill">
                <input type="text" oninput={(e) => setTargetScene(e.target.value)}/>
                <button onclick={() => sceneController.createScene(props.sessionData.user_id, targetScene())}>
                    Create Scene
                </button>
            </div>
            <div class="keep row-container fill">
                <button class="icon-button" onclick={() => sceneController.fetchScenes(
                    props.sessionData.user_id,
                    // TODO: password
                )}>
                    <RefreshIcon />
                </button>
                <span>Found {sceneController.scenes.length} scenes</span>
            </div>
            <Show when={!sceneController.isLoading} fallback={
                <span>Loading Scenes...</span>
            }>
                <For each={sceneController.scenes}>
                    {(scene) => <div class="container">
                        {/* TODO: SCENE CARD */}
                        <div class="keep row-container">
                            <span>{scene.uid}</span>
                            <button onclick={() => openScene(scene.uid)}>
                                Connect
                            </button>
                        </div>
                        <div class="container">
                            <span>Scene Dependencies</span>
                            <ul>
                                <For each={Object.entries(scene.dependencies)}>
                                    {([dependency, version]) => <li>
                                        {dependency}: {version}
                                    </li>}
                                </For>
                            </ul>
                        </div>
                    </div>}
                </For>
            </Show>
        </div>
    )
}
