export class NDArrayView {
    public strides: number[];

    constructor(
        public data: Float32Array, 
        public shape: number[]
    ) {
        this.strides = NDArrayView.computeStrides(shape);
    }

    private static computeStrides(shape: number[]): number[] {
        const strides = new Array(shape.length);
        let stride = 1;
        for (let i = shape.length - 1; i >= 0; i--) {
            strides[i] = stride;
            stride *= shape[i];
        }
        return strides;
    }

    private getLinearIndex(indices: number[]): number {
        if (indices.length !== this.shape.length) {
            throw new Error(`Initial dimension number (${indices.length}) doesn't correpond to calculated (${this.shape.length}).`);
        }

        let index = 0;
        for (let i = 0; i < this.shape.length; i++) {
            const idx = indices[i];
            if (idx < 0 || idx >= this.shape[i]) {
                throw new Error(`Index ${idx} out of bounds for dim ${i} (size ${this.shape[i]}).`);
            }
            index += idx * this.strides[i];
        }
        return index;
    }

    
    public get(...indices: number[]): number {
        const linearIndex = this.getLinearIndex(indices);
        return this.data[linearIndex];
    }

    public set(value: number, ...indices: number[]): void {
        const linearIndex = this.getLinearIndex(indices);
        this.data[linearIndex] = value;
    }
}