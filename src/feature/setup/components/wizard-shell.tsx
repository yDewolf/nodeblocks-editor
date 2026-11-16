import { For, Suspense, createEffect, on, type Component } from "solid-js";
import { Dynamic } from "solid-js/web";
import { WizardController } from "../utils/wizard-controller";
import { useI18n } from "~/i18n/i18n-context";

// TODO: tradução
export function WizardShell<TData extends object>(props: { wizard: WizardController<TData, Component> }) {
    const { t } = useI18n();

    const wizard = props.wizard;
    let heading: HTMLHeadingElement | undefined;

    createEffect(on(() => wizard.currentStepId, () => heading?.focus(), { defer: true }));

    const nextLabel = () =>
        wizard.busy ? "Working..." : (wizard.currentStep.nextLabel ?? (wizard.isLastStep ? t("actions.finish") : t("actions.continue")));

    return (
        <div class="wizard container">
            <div class="wizard-holder">
                <div class="wizard-steps container fill">
                    <ul class="wizard-step-list">
                        <For each={wizard.visibleSteps}>
                            {(step, index) => (
                                <li
                                    aria-current={step.id === wizard.currentStepId ? "step" : undefined}
                                    classList={{ done: wizard.isCompleted(step.id) }}
                                >
                                    <button class="text-button" type="button" disabled={!wizard.canGoTo(step.id)} onClick={() => wizard.goTo(step.id)}>
                                        {index() + 1}. {step.title}
                                    </button>
                                </li>
                            )}
                        </For>
                    </ul>
                </div>
                <section class="wizard-body fill">
                    <div class="wizard-body-header">
                        <p class="wizard-position">
                            Step {wizard.position().index} of {wizard.position().total}
                        </p>
                        <h2 id="wizard-title" ref={heading} tabindex="-1">
                            {wizard.currentStep.title}
                        </h2>
                    </div>
                    <div class="container fill scrollable wizard-step-content">
                        <Suspense fallback={<p>{t("messages.loading")}</p>}>
                            <Dynamic component={wizard.currentStep.view} />
                        </Suspense>
                    </div>
                    <p role="alert" class="wizard-error">
                        {wizard.error}
                    </p>
                </section>
                <footer class="wizard-footer">
                    <div class="setup-actions">
                        <button class="text-button" type="button" onClick={() => wizard.back()} disabled={!wizard.canGoBack}>
                            {t("actions.goBack")}
                        </button>
                        <button class="text-button" type="button" onClick={() => void wizard.next()} disabled={wizard.busy}>
                            {nextLabel()}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}