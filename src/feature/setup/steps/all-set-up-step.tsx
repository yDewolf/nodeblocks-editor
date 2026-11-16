import { useI18n } from "~/i18n/i18n-context"

export const AllSetUp = () => {
    const {t} = useI18n();
    return (
        <>
            <p>{t("pages.setupWizard.allSetUp.everythingIsSet")}</p>
            <p class="note">{t("pages.setupWizard.allSetUp.thanksForUsingNodeblocks")}</p>
            <br />
            <p><a href="https://github.com/yDewolf/nodeblocks-editor/issues/new/choose" target="_blank">{t("pages.setupWizard.allSetUp.reportIssuesHere")}</a></p>
            <p>{t("pages.setupWizard.allSetUp.redoSetupInstruction")}</p>
        </>
    )
}