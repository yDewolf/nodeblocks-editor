import { For, JSXElement, ParentComponent, Show } from "solid-js";
import { useI18n } from "~/i18n/i18n-context";


export const ModalOverlay: ParentComponent<{
    title: string
    closeModal: () => void
    isModalOpened: () => boolean
    buttons?: JSXElement[]
}> = (props) => {
    const { t } = useI18n(); 
    return (
        <Show when={props.isModalOpened()}>
            <div class="modal-overlay">
                <div class="modal-overlay-background"></div>
                <div class="modal-content-holder">
                    <div class="modal-header">
                        <h3>{props.title}</h3>
                    </div>
                    <div class="container modal-content scrollable fill">
                        {props.children}
                    </div>
                    <div class="modal-bottom">
                        <div class="row-container">
                            <button class="text-button" onclick={props.closeModal}>
                                {t("words.close")}
                            </button>
                            <For each={props.buttons ?? []}>
                                {(button) => button}
                            </For>
                        </div>
                    </div>
                </div>
            </div>
        </Show>
    )
}
