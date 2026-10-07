import { DataTypeSpec } from "~/protocols/nodeblocks/manifests/node/datatype-spec";
import { NamespaceUtils } from "~/protocols/nodeblocks/namespace-model";

export class DatatypeHelper {
    public static areTypesCompatible(source_spec: DataTypeSpec, target_spec: DataTypeSpec): boolean {
        if (source_spec.fqn == target_spec.fqn) {
            return true;
        }

        if (source_spec.fqn in target_spec.whitelist) {
            return true;
        }
        
        if (!source_spec.base_id) return false; 
        return source_spec.base_id in target_spec.whitelist;
    } 
}