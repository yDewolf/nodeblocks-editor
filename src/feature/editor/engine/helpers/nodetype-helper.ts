import { NodeTypeSpec } from "~/protocols/nodeblocks/manifests/node/node-spec";

export class NodeTypeHelper {

    static extract_datatype_dependencies(spec: NodeTypeSpec): Set<string> {
        let datatype_fqns: Set<string> = new Set();
        for (const param of Object.values(spec.parameters)) {
            datatype_fqns.add(param.datatype_fqn);
        }

        for (const slot of Object.values(spec.slots)) {
            datatype_fqns.add(slot.data_type_id);
        }

        return datatype_fqns;
    }
    
}