import { createContext, useContext } from "solid-js";
import { WizardController } from "./wizard-controller";

export function createWizardContext<TData extends object, TView>() {
  const Context = createContext<WizardController<TData, TView>>();

  function useWizard(): WizardController<TData, TView> {
    const wizard = useContext(Context);
    if (!wizard) throw new Error("useWizard must be called inside the wizard Provider");
    return wizard;
  }

  return { WizardProvider: Context.Provider, useWizard };
}
