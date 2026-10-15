import { CanvasCamera } from "../../canvas/editor-space"
import { Grid } from "../../canvas/grid"

export const GridView = (props: {camera: CanvasCamera, grid: Grid}) => {
    return (
        <div class="grid"
            style={{
                "background-position": `${-props.camera.offset.x * props.camera.zoom}px ${-props.camera.offset.y * props.camera.zoom}px `,
                "background-size": `${props.grid.grid.x * props.camera.zoom}px ${props.grid.grid.y * props.camera.zoom}px`
            }}
        >
        </div>
    )
}