import { createEffect, createMemo, createSignal, For, Match, Show, Switch } from "solid-js";
import { DataTypeValuePack } from "./datatype-value-view";
import { ScalarView } from "./scalar-view";
import { DefaultDataTypes } from "~/protocols/nodeblocks/manifests/node/datatype-enums";
import { NDArrayView } from "~/protocols/nodeblocks/utils/ndarray_view";
import { useI18n } from "~/i18n/i18n-context";

const ArrayCanvas = (props: { data: any, shape: number[], target_channel: number }) => {
    let canvasRef: HTMLCanvasElement | undefined;
    
    createEffect(() => {
        if (!canvasRef || !props.data) return;
        const ctx = canvasRef.getContext('2d');
        if (!ctx) return;

        const shape = props.shape;
        const [b, c, h, w] = shape.length === 1 ? [1, 1, 1, shape[0]] : 
                            shape.length === 2 ? [1, 1, shape[0], shape[1]] :
                            shape.length === 3 ? [1, shape[0], shape[1], shape[2]] :
                            [shape[0], shape[1], shape[2], shape[3]];

        canvasRef.width = w;
        canvasRef.height = h;
        
        const imageData = ctx.createImageData(w, h);
        const buf = imageData.data;
        const isTensor = props.data instanceof NDArrayView;

        const getValue = (batch: number, channel: number, y: number, x: number): number => {
            let val = 0;
            if (isTensor) {
                const tensor = props.data as NDArrayView;
                if (shape.length === 1) val = tensor.get(x);
                else if (shape.length === 2) val = tensor.get(y, x);
                else if (shape.length === 3) val = tensor.get(channel, y, x);
                else val = tensor.get(batch, channel, y, x);
            } else {
                const data = props.data;

                if (shape.length === 1) val = data[x];
                else if (shape.length === 2) val = data[y]?.[x];
                else if (shape.length === 3) val = data[channel]?.[y]?.[x];
                else val = data[batch]?.[channel]?.[y]?.[x];
            }

            if (typeof val === "number") {
                if (val >= 0 && val <= 1.0) {
                    return Math.floor(val * 255);
                }
                return Math.max(0, Math.min(255, Math.floor(val)));
            }
            return 0;
        };

        const targetChannel = props.target_channel;
        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                const idx = (i * w + j) * 4;
                let r = 0, g = 0, bVal = 0, a = 255;

                if (c === 1 || shape.length <= 2) {
                    r = g = bVal = getValue(0, 0, i, j);

                } else if (c >= 3) {
                    r = getValue(0, 0, i, j);
                    g = getValue(0, 1, i, j);
                    bVal = getValue(0, 2, i, j);
                    if (c === 4) {
                        a = getValue(0, 3, i, j);
                    }

                } else {
                    r = g = bVal = getValue(0, targetChannel, i, j);
                }

                buf[idx] = r;
                buf[idx + 1] = g;
                buf[idx + 2] = bVal;
                buf[idx + 3] = a;
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
    if (array instanceof NDArrayView) {
        return array.shape;
    }

    const shape = [];
    let current = array;
    while (Array.isArray(current)) {
        shape.push(current.length);
        current = current[0];
    }
    return shape;
};

export const ArrayView = (props: { output_value?: DataTypeValuePack }) => {
    const {t} = useI18n();
    if (!props.output_value) return <div>{t("words.empty")}</div>;
    const [target_channel, setTargetChannel] = createSignal(0);
    const shape = createMemo(() => {
        if (props.output_value?.value_meta?.type === DefaultDataTypes.ARRAY && props.output_value?.value_meta?.shape) {
            return props.output_value?.value_meta.shape;
        }

        if (props.output_value?.value instanceof NDArrayView) {
            return props.output_value.value.shape;
        }

        return get_array_shape(props.output_value?.value);
    });

    const dims = () => shape().length;
    const channelCount = createMemo(() => {
        if (dims() == 3) return shape()[0];
        if (dims() == 4) return shape()[1];
        return 1;
    });

    return (
        <div class="output-array-container container">
            <div class="field-grid-holder">
                <div class="field-grid">
                    <span class="field-value-label">{t("datatype.shape")}</span>
                    <span class="field-value">({shape().join(", ")})</span>
                </div>
                <Show when={channelCount() > 1 && channelCount() != 3 && channelCount() != 4}>
                    <div class="field-grid">
                        <label class="field-value-label" for="target-channels">{t("datatype.channel")}</label>
                        <div class="field-value">
                            <select 
                                value={target_channel()} 
                                id="target-channels" 
                                onchange={(e) => {
                                    setTargetChannel(Number.parseInt(e.currentTarget.value));
                                }}
                            >
                                <For each={Array.from({ length: channelCount() }, (_, i) => i)}>
                                    {(_, idx) => (
                                        <option value={idx()}>
                                            {idx()}
                                        </option>
                                    )}
                                </For>
                            </select>
                        </div>
                    </div>
                </Show>
            </div>
            <Switch fallback={
                <Switch>
                    <Match when={dims() <= 3 || (dims() == 4 && shape().at(0) == 1)}>
                        <ArrayCanvas data={props.output_value.value} shape={shape()} target_channel={target_channel()}/>
                    </Match>
                    <Match when={dims() > 3}>
                        <div class="simplified-view">
                            {t("datatype.message.highDimTensor", shape().reduce((a, b) => a * b, 1))}
                        </div>
                    </Match>
                </Switch>
            }>
                <Match when={
                    dims() < 1 || 
                    (shape().every((dim_size: any) => dim_size === 1))
                }>
                    <ScalarView output_value={props.output_value}/>
                </Match>
            </Switch>
        </div>
    );
};