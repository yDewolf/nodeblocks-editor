import { Component } from "solid-js";
import { SetStoreFunction } from "solid-js/store";

export interface StepContext<TData> {
    readonly data: TData;
    setData: SetStoreFunction<TData>;
}

export type ValidationResult = string | null | undefined;

export interface WizardStepDef<TData, TView = Component> {
    id: string;
    title: string;
    view: TView;
    when?: (data: TData) => boolean;
    validate?: (data: TData) => ValidationResult | Promise<ValidationResult>;
    beforeNext?: (context: StepContext<TData>) => void | Promise<void>;
    allowBack?: (data: TData) => boolean;
    nextLabel?: string;
}

export type NextResult =
    | { kind: "blocked"; message: string }
    | { kind: "moved"; to: string }
    | { kind: "finished" };
