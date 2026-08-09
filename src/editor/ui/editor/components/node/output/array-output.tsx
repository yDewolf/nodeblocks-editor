import { createEffect, createMemo, createSignal, For, Index, Match, Show, Switch } from "solid-js";
import { ScalarView } from './scalar-output';

// TODO: add a interpreter option on the UI so the user can select
// how the array should be interpreted
const ArrayCanvas = (props: { data: any[], shape: number[], target_channel: number }) => {
    let canvasRef: HTMLCanvasElement | undefined;

    createEffect(() => {
        if (!canvasRef) return;
        const ctx = canvasRef.getContext('2d');
        if (!ctx) return;
        if (!(props.data instanceof Array)) {
            return;
        }

        const [b, c, h, w] = props.shape.length === 1 ? [0, 0, 1, props.shape[0]] : 
                            props.shape.length === 2 ? [0, 0, props.shape[0], props.shape[1]] :
                            props.shape.length === 3 ? [0, ...props.shape] :
                            props.shape
        ;

        canvasRef.width = w;
        canvasRef.height = h;
        
        const imageData = ctx.createImageData(w, h);
        console.log(b, c, h, w)
        let data = b == 1 ? props.data[0] : props.data;
        if (c == 1) data = data[props.target_channel];
        if (c >= 3 && c <= 4) data = data;
        else if (c > 4) {
            data = data[props.target_channel];
        }
        console.log(data);
        const shape = get_array_shape(data)
        console.log(shape);

        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                const idx = (i * w + j) * 4;
                let r, g, b;
                let a = 255;

                if (shape.length === 1) { // 1D
                    r = g = b = data[j];
                } else if (shape.length === 2 || c == 1) { // 2D
                    r = g = b = data[i][j];
                } else if (c >= 3 && c <= 4) { // 3D
                    r = data[0][i][j] || 0;
                    g = data[1][i][j] || 0;
                    b = data[2][i][j] || 0;
                    if (c === 4) {
                        a = data[3][i][j] || 255;
                    }
                }

                imageData.data[idx] = r;
                imageData.data[idx + 1] = g;
                imageData.data[idx + 2] = b;
                imageData.data[idx + 3] = a;
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
    const [target_channel, setTargetChannel] = createSignal(0);

    const shape = createMemo(() => get_array_shape(props.output_value));
    const dims = () => shape().length;

    return (
        <div class="output-array-container container">
            <div class="field-grid-holder">
                <div class="field-grid">
                    <span class="field-value-label">Shape</span>
                    <span class="field-value">({shape().join(", ")})</span>
                </div>
                <Show when={dims() > 2 && shape()[0] > 4}>
                    <div class="field-grid">
                        <label class="field-value-label" for="target-channels">Channel:</label>
                        <div class="field-value">
                            <select value={0} id="target-channels" onchange={(e) => {
                                setTargetChannel(Number.parseInt(e.currentTarget.value));
                            }}>
                                <For each={Array.from({length: shape()[0]}, (_, i) => i)} >
                                    {(shape_size, idx) => {
                                        return (
                                            <option value={idx()}>
                                                {idx()}
                                            </option>   
                                        )
                                    }}
                                </For>
                            </select>
                        </div>
                    </div>
                </Show>
            </div>
            <Switch fallback={
                <Switch fallback={<div class="text-preview">{JSON.stringify(props.output_value).slice(0, 100)}...</div>}>
                    <Match when={dims() <= 3 || (dims() === 4 && shape().at(0) === 1)}>
                        <ArrayCanvas data={props.output_value} shape={shape()} target_channel={target_channel()}/>
                    </Match>
                    <Match when={dims() > 3}>
                        <div class="simplified-view">
                            High-dimensional tensor. 
                            Size: {shape().reduce((a, b) => a * b, 1)} elements
                        </div>
                    </Match>
                </Switch>
            }>
                <Match when={
                    dims() < 1 || 
                    (shape().every((dim_size) => dim_size == 1))
                }>
                    <ScalarView output_value={props.output_value}/>
                </Match>
            </Switch>
        </div>
    );
};