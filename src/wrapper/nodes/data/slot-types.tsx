import { BaseDataType } from "./node-data-type";

export class BaseSlotType {
    data_type: BaseDataType

    constructor(data_type: BaseDataType) {
        this.data_type = data_type;
    }
}