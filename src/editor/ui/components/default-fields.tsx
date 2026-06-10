import { Vector2 } from "~/wrapper/data_types/geometry"
import { FieldValueDisplayer } from "./input-fields"

export const VectorField = (props: {
    value: Vector2
    field_id?: string
}) => {
    return (
        <div class="field-grid">
            <FieldValueDisplayer value_label="X" value_element={
                () => <input value={props.value.x.toFixed(1)} id={props.field_id + "_x"} readonly/>
            } field_id={props.field_id + "_x"}/>
            <FieldValueDisplayer value_label="Y" value_element={
                () => <input value={props.value.y.toFixed(1)} id={props.field_id + "_y"} readonly/>
            } field_id={props.field_id + "_y"}/>
        </div>
    )
}