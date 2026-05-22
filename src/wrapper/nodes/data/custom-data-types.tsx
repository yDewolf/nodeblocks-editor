import { BaseDataType, DataTypeUtils, DefaultRenderers, UNKNOWN_TYPE } from "./node-data-type";

export class CustomDataType extends BaseDataType {
    constructor(type_id: string, data_type?: string, renderer?: string, conn_whitelist: string[] = []) {
        const [type_whitelist, name_whitelist] = DataTypeUtils.parse_whitelist(conn_whitelist, DataTypeUtils.parse_data_type);
        let parsed_data_type = UNKNOWN_TYPE;
        if (data_type) {
            parsed_data_type = DataTypeUtils._match_default_data_type(data_type);
        }

        super(
            type_id, 
            parsed_data_type.base, 
            type_whitelist, 
            name_whitelist, 
            renderer != undefined ? renderer as DefaultRenderers : undefined
        );
    }
}