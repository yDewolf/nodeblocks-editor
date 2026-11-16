import { createStore, SetStoreFunction } from "solid-js/store";
import { NextResult, WizardStepDef } from "./wizard-step";
import { batch, createSignal, Setter } from "solid-js";

export class WizardController<TData extends object, TView> {
    private _data: TData;
    public setData: SetStoreFunction<TData>;

    private _completed: () => readonly string[];
    private _setCompleted: Setter<readonly string[]>;

    private _currentId: () => string;
    private _setCurrentId: Setter<string>;

    private _isBusy: () => boolean;
    private _setIsBusy: Setter<boolean>;

    private _error: () => string | null;
    private _setError: Setter<string | null>;

    constructor(
        private readonly steps: WizardStepDef<TData, TView>[],
        initialData: TData,
        private onFinish?: (data: TData) => void | Promise<void>,
    ) {
        [this._data, this.setData] = createStore<TData>(initialData);
        [this._completed, this._setCompleted] = createSignal<readonly string[]>([]);
        [this._currentId, this._setCurrentId] = createSignal<string>(
            (this.steps.find((step) => isStepVisible(step, this.data)) ?? this.steps[0]).id
        );
        [this._isBusy, this._setIsBusy] = createSignal<boolean>(false);
        [this._error, this._setError] = createSignal<string | null>(null);
    }

    get data() { return this._data; }
    get busy() { return this._isBusy(); }
    get error() { return this._error(); }

    get currentStep() { return this.steps.find((step) => step.id == this.currentStepId)! }
    get currentStepId() { return this._currentId(); }
    get visibleSteps() { return this.steps.filter((step) => isStepVisible(step, this.data)); }
    get isLastStep() { return this.neighborId(1) == null; }
    get canGoBack() { return !this._isBusy() && this.previousId() != null; }

    public markCompleted(id: string) {
        this._setCompleted((ids) => (ids.includes(id) ? ids : [...ids, id]))
    }

    public isCompleted(stepId: string) {
        return this._completed().includes(stepId);
    }

    public position(): { index: number; total: number } {
        const visible = this.visibleSteps;
        const at = this.steps.findIndex((step) => step.id == this.currentStepId);
        const index = visible.filter((step) => this.steps.indexOf(step) <= at).length;
        return { index: Math.max(index, 1), total: visible.length };
    }

    // -- navigation methods

    public canGoTo(id: string): boolean {
        if (this._isBusy() || id == this.currentStepId || !this.isCompleted(id)) return false;
        const target = this.steps.find((step) => step.id === id);
        
        if (!target || !isStepVisible(target, this.data)) return false;
        
        const allowBack = this.currentStep.allowBack;
        return allowBack ? allowBack(this.data) : true;
    }

    public goTo(id: string) {
        if (!this.canGoTo(id)) return;
        batch(() => {
            this._setError(null);
            this._setCurrentId(id);
        });
    }

    public back() {
        const to = this.previousId();
        if (this._isBusy() || !to) return;
        this.goTo(to);
    }

    public async next() {
        if (this._isBusy()) return;
        batch(() => {
            this._setIsBusy(true);
            this._setError(null);
        });
    
        try {
            const result = await this.evaluateNext();
            switch (result.kind) {
                case "blocked":
                    this._setError(result.message);
                    break;
                case "moved":
                    this.markCompleted(this.currentStepId);
                    this._setCurrentId(result.to);
                    break;
                case "finished":
                    await this.onFinish?.(this.data);
                    this.markCompleted(this.currentStepId);
                    break;
                }
        } catch (e) {
            this._setError(e instanceof Error ? e.message : String(e));
        } finally {
            this._setIsBusy(false);
        }
    }

    // -- utils

    private neighborId(direction: 1 | -1) {
        const start = this.steps.findIndex((step) => step.id === this.currentStepId);
        if (start === -1) return null;

        for (let i = start + direction; i >= 0 && i < this.steps.length; i += direction) {
            if (isStepVisible(this.steps[i], this.data)) return this.steps[i].id;
        }
        return null;
    }

    private previousId() {
        const current = this.steps.find((step) => step.id == this.currentStepId);
        if (!current) return null;
        if (current.allowBack && !current.allowBack(this.data)) return null;
        return this.neighborId(-1);
    }

    private async evaluateNext(): Promise<NextResult> {
        const step = this.currentStep;
        const invalid = await step.validate?.(this.data);
        if (invalid) return { kind: "blocked", message: invalid };
    
        await step.beforeNext?.({
            get data() { return this.data }, setData: this.setData
        });
    
        const to = this.neighborId(1);
        return to ? { kind: "moved", to } : { kind: "finished" };
    }
}

// -- utils

function isStepVisible<TData, TView>(step: WizardStepDef<TData, TView>, data: TData) {
    return step.when ? step.when(data) : true;
}