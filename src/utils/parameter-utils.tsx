export const clamp = (val: number, min?: number, max?: number) => {
    let v = val;
    if (min !== undefined) v = Math.max(min, v);
    if (max !== undefined) v = Math.min(max, v);
    return v;
};