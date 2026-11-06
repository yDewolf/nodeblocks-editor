import { createEffect, createSignal, Match, onCleanup, Show, Switch } from "solid-js";
import { useSceneRuntime } from "~/feature/scene/scene-runtime-context"
import RefreshIcon from '~/assets/icons/refresh.svg';
import { useEditor } from "../../contexts/scene-editor-context";
import { ForbiddenError, UnauthorizedError } from "~/network/api/http_errors";
import { useNavigate } from "@solidjs/router";
import { WebsocketStatus } from "~/protocols/nodeblocks/network/server-message-protocol";

enum StateTypes {
    ACCESS_DENIED,
    LOADING,
    CONNECTING,
    FAILED
}

export const EditorLoadingOverlay = () => {
    const runtime = useSceneRuntime();
    const editor = useEditor();
    const navigate = useNavigate();

    const startCountDown = () => {
        setTimeout(() => {
            if (state() != StateTypes.LOADING || state() != StateTypes.CONNECTING) {
                setCountDown((n) => n - 1);
                if (countDown() <= 0) {
                    navigate("/");
                } else {
                    startCountDown();
                }
            }
        }, 1000);
    }

    const [message, setMessage] = createSignal<string>("");
    const [state, setState] = createSignal<StateTypes | undefined>(undefined);
    const unsubscribe = editor.sceneConnection.onError((error, message) => {
        setMessage(message);
        if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
            setState(StateTypes.ACCESS_DENIED);
            setMessage("You don't have access to this scene.")
        } else {
            setState(StateTypes.FAILED);
        }
        setCountDown(10);
        startCountDown();
    });

    onCleanup(() => unsubscribe)
    
    createEffect(() => {
        if (editor.sceneConnection.status == WebsocketStatus.CONNECTING) {
            setState(StateTypes.CONNECTING);
            setMessage(`Connecting to server... (${editor.sceneConnection.currentAttempt}/${editor.sceneConnection.maxAttempts})`);
        }

        if (state() == StateTypes.LOADING && runtime?.stateController.isLoadingScene == false) {
            setState()
        }
        if (runtime?.stateController.isLoadingScene) {
            setState(StateTypes.LOADING);
            setMessage("Loading scene...");
        }
    });
    const [countDown, setCountDown] = createSignal(0);

    return (
        <Switch>
            <Match when={state() == StateTypes.ACCESS_DENIED || state() == StateTypes.FAILED}>
                <div class="loading-overlay">
                    <div class="loading-overlay-background"></div>
                    <h3>{message()}</h3>
                    <span>Returning to home in {countDown()} seconds</span>
                </div>
            </Match>
            <Match when={state() == StateTypes.LOADING || state() == StateTypes.CONNECTING}>
                <div class="loading-overlay">
                    <div class="loading-overlay-background"></div>
                    <h3>{message()}</h3>
                    <RefreshIcon class="auto-loop"/>
                </div>
            </Match>
        </Switch>
    )
}