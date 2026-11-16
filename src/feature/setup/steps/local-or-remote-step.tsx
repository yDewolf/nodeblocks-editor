import { useSetup } from "../setup-wizard-context";

export const LocalOrRemoteStep = () => {
    const wizard = useSetup();
    
    return (
        <>
            <p>Would you like to run Nodeblocks locally or connect to a remote server?</p>
            <p class="note"><b>Note:</b> you can change your answer anytime by redoing this setup in settings menu.</p>
            
            <div class="field-grid">
                <label for="local-install">Install nodeblocks and run locally</label>
                <input class="field-input" type="checkbox" id="local-install"
                    checked={wizard.data.localInstall} oninput={(e) => {
                        wizard.setData("localInstall", e.target.checked);
                    }}
                />
            </div>
        </>
    );
}