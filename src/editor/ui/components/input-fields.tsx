import { JSXElement, Show } from "solid-js"

export const SimpleField = (props: {
    field_name: string,
    field_displayer: () => JSXElement,
    field_id?: string
}) => {
    return (
        <div class="field-grid fill">
            <label class="field-label" for={props.field_id}>{props.field_name}</label>
            {props.field_displayer()}
        </div>
    )
}

export const FieldSection = (props: {
    field_name: string, 
    field_displayer: () => JSXElement
}) => {
    return (
        <div class="field-section">
            <label>{props.field_name}</label>
            {props.field_displayer()}
        </div>
    )
}

export const FieldValueDisplayer = (props: {
    value_label?: string,
    value_element: () => JSXElement,
    field_id?: string,
}) => {
    return (
        <div class="field-holder">
            <Show when={props.value_label}>
                <label for={props.field_id} class="field-value-label">{props.value_label}</label>
            </Show>
            <div class="field-value fill">
                {props.value_element()}
            </div>
        </div>
    )
}
