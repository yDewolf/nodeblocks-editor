import { useSetup } from "../setup-wizard-context";
import { LoginForm } from '../../home/components/login-form';
import { useI18n } from "~/i18n/i18n-context";

export const CreateUserStep = () => {
    const wizard = useSetup();
    const {t} = useI18n();

    return (
        <>
            <p>{t("pages.setupWizard.createUser.editorRequiresUser")}</p>
            <p class="note">{t("pages.setupWizard.createUser.scenesAreLinkedNote")}</p>
            <p class="note">{t("pages.setupWizard.createUser.sessionRemainsNote")}</p>
            <br />
            <LoginForm />
        </>
    );
}