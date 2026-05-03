import { createEffect, createMemo, Match, Switch } from "solid-js";

const ArrayCanvas = (props: { data: any[], shape: number[] }) => {
    let canvasRef: HTMLCanvasElement | undefined;

    createEffect(() => {
        if (!canvasRef) return;
        const ctx = canvasRef.getContext('2d');
        if (!ctx) return;
        if (!(props.data instanceof Array)) {
            console.log(props.shape);
            return;
        }

        const [h, w, c] = props.shape.length === 1 ? [1, props.shape[0], 1] : 
                          props.shape.length === 2 ? [props.shape[0], props.shape[1], 1] :
                          props.shape;

        canvasRef.width = w;
        canvasRef.height = h;
        
        const imageData = ctx.createImageData(w, h);
        const data = props.data;

        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                const idx = (i * w + j) * 4;
                let r, g, b;

                if (props.shape.length === 1) { // 1D
                    r = g = b = data[j];
                } else if (props.shape.length === 2) { // 2D
                    r = g = b = data[i][j];
                } else { // 3D
                    r = data[i][j][0] || 0;
                    g = data[i][j][1] || 0;
                    b = data[i][j][2] || 0;
                }

                imageData.data[idx] = r;
                imageData.data[idx + 1] = g;
                imageData.data[idx + 2] = b;
                imageData.data[idx + 3] = 255;
            }
        }
        ctx.putImageData(imageData, 0, 0);
    });

    return (
        <canvas 
            ref={canvasRef} 
            style={{ 
                "width": "100%", 
                "height": "auto", 
                "image-rendering": "pixelated",
                "background-color": "#000",
                "border-radius": "4px"
            }} 
        />
    );
};


const get_array_shape = (array: any): number[] => {
    const shape = [];
    let current = array;
    while (Array.isArray(current)) {
        shape.push(current.length);
        current = current[0];
    }
    return shape;
};

export const ArrayView = (props: { output_value: any | undefined }) => {
    if (!props.output_value) return <div>Empty</div>;

    const shape = createMemo(() => get_array_shape(props.output_value));
    const dims = () => shape().length;

    return (
        <div class="node-output output-array-container">
            <div class="array-info">Shape: ({shape().join(", ")})</div>
            
            <Switch fallback={<div class="text-preview">{JSON.stringify(props.output_value).slice(0, 100)}...</div>}>
                <Match when={dims() == 0}>
                    <span>{props.output_value}</span>
                </Match>
                <Match when={dims() <= 3}>
                    <ArrayCanvas data={props.output_value} shape={shape()} />
                </Match>
                <Match when={dims() > 3}>
                    <div class="simplified-view">
                        High-dimensional tensor. 
                        Size: {shape().reduce((a, b) => a * b, 1)} elements
                    </div>
                </Match>
            </Switch>
        </div>
    );
};