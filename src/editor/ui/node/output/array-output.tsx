import { createEffect, createMemo, createSignal, For, Index, Match, Switch } from "solid-js";
import { ScalarView } from './scalar-output';

const ArrayCanvas = (props: { data: any[], shape: number[], target_channel: number }) => {
    let canvasRef: HTMLCanvasElement | undefined;

    createEffect(() => {
        if (!canvasRef) return;
        const ctx = canvasRef.getContext('2d');
        if (!ctx) return;
        if (!(props.data instanceof Array)) {
            console.log(props.shape);
            return;
        }

        const [c, h, w] = props.shape.length === 1 ? [0, 1, props.shape[0]] : 
                          props.shape.length === 2 ? [0, props.shape[0], props.shape[1]] :
                          props.shape
        ;

        canvasRef.width = w;
        canvasRef.height = h;
        
        const imageData = ctx.createImageData(w, h);
        const data = c == 1 ? props.data[props.target_channel] : c > 1 ? props.data[props.target_channel] : props.data;
        const shape = get_array_shape(data)

        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                const idx = (i * w + j) * 4;
                let r, g, b;
                let a = 255;

                if (shape.length === 1) { // 1D
                    r = g = b = data[j];
                } else if (shape.length === 2 || c == 1) { // 2D
                    r = g = b = data[i][j];
                } else { // 3D
                    r = data[i][j][0] || 0;
                    g = data[i][j][1] || 0;
                    b = data[i][j][2] || 0;
                    a = data[i][j][3] || 255;
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
        <Switch fallback={
            <div class="output-array-container">
                <div class="array-info row-container fill">
                    <span>Shape: ({shape().join(", ")})</span>

                    <div class="row-container">
                        <label for="target-channels">Channel:</label>
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
                <Switch fallback={<div class="text-preview">{JSON.stringify(props.output_value).slice(0, 100)}...</div>}>
                    <Match when={dims() <= 3}>
                        <ArrayCanvas data={props.output_value} shape={shape()} target_channel={target_channel()}/>
                    </Match>
                    <Match when={dims() > 3}>
                        <div class="simplified-view">
                            High-dimensional tensor. 
                            Size: {shape().reduce((a, b) => a * b, 1)} elements
                        </div>
                    </Match>
                </Switch>
            </div>
        }>
            <Match when={dims() < 1 || dims() == 1 && props.output_value.length == 1}>
                <ScalarView output_value={props.output_value}/>
            </Match>
        </Switch>
    );
};