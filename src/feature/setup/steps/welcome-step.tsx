import { useI18n } from "~/i18n/i18n-context";
import { useSetup } from "../setup-wizard-context";
import { LangSelectField, ThemeSelectorField } from "~/feature/home/settings/app-settings-view";

export default function WelcomeStep() {
    const {t} = useI18n();
    const wizard = useSetup();

    return (
        <>
            <p>{t("pages.setupWizard.welcome.wizardInfo")}</p>
            <p>{t("pages.setupWizard.welcome.startInstructions")}</p>
            <br />
            <div class="field-grid">
                <ThemeSelectorField/>
            </div>
            <div class="field-grid">
                <LangSelectField/>
            </div>
        </>
    );
}