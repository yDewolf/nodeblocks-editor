import { useI18n } from "~/i18n/i18n-context";
import { useSetup } from "../setup-wizard-context";

export const LocalOrRemoteStep = () => {
    const {t} = useI18n();
    const wizard = useSetup();
    
    return (
        <>
            <p>{t("pages.setupWizard.serverChoice.localOrRemoteQuestion")}</p>
            <p class="note"><b>{t("words.note")}:</b> {t("pages.setupWizard.serverChoice.changeAnwserNote")}</p>
            
            <div class="field-grid">
                <label for="local-install">{t("pages.setupWizard.serverChoice.installAndRunLocallyOption")}</label>
                <input class="field-input" type="checkbox" id="local-install"
                    checked={wizard.data.localInstall} oninput={(e) => {
                        wizard.setData("localInstall", e.target.checked);
                    }}
                />
            </div>
        </>
    );
}