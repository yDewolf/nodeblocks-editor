import { BaseSlotType, DataTypeUtils } from './node-data-type';

export class CustomSlotType extends BaseSlotType {
    constructor(type_name: string, data_type: string, super_type: string, conn_whitelist: string[] = []) {
        const [type_whitelist, name_whitelist] = DataTypeUtils.parse_whitelist(conn_whitelist, DataTypeUtils.parse_slot_super_type);
        const parsed_data_type = DataTypeUtils._match_node_data_type(data_type);
        const parsed_super_type = DataTypeUtils.parse_slot_super_type(super_type);

        super(type_name, parsed_data_type, parsed_super_type, type_whitelist, name_whitelist);
    }
}