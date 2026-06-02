import { JSXElement, Show } from "solid-js"

export const SimpleField = (props: {
    field_name: string,
    field_displayer: () => JSXElement
}) => {
    return (
        <div class="field-grid">
            <label class="field-label">{props.field_name}</label>
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
    value_element: () => JSXElement
}) => {
    return (
        <div class="field-holder">
            <Show when={props.value_label}>
                <span class="field-value-label">{props.value_label}</span>
            </Show>
            <div class="field-value">
                {props.value_element()}
            </div>
        </div>
    )
}
