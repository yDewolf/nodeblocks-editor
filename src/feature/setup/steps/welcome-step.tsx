import { SetupData, useSetup } from "../setup-wizard-context";
import { LangSelectField, ThemeSelectorField } from "~/feature/home/settings/app-settings-view";

export default function WelcomeStep() {
  const wizard = useSetup();

  return (
        <>
            <p>This wizard will prepare everything Nodeblocks needs to run on your computer</p>
            <p>Start by selecting your prefered UI theme and language.</p>
            <div class="field-grid">
                <ThemeSelectorField/>
            </div>
            <div class="field-grid">
                <LangSelectField/>
            </div>
        </>
  );
}