import { Vector2 } from "~/wrapper/data_types/geometry"
import { FieldValueDisplayer } from "./input-fields"

export const VectorField = (props: {value: Vector2}) => {
    return (
        <div class="field-grid">
            <FieldValueDisplayer value_label="X" value_element={
                () => <span>{props.value.x.toFixed(1)}</span>
            }/>
            <FieldValueDisplayer value_label="Y" value_element={
                () => <span>{props.value.y.toFixed(1)}</span>
            }/>
        </div>
    )
}