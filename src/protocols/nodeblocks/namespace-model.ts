export interface NamespaceModel {
    namespace: string;
    id: string;
    fqn: string;
}

export function createNamespaceModel(namespace: string, id: string): NamespaceModel {
    return {
        namespace,
        id,
        get fqn() {
            return `${this.namespace}:${this.id}`;
        }
    };
}

export class NamespaceUtils {
    public static fqn(model: NamespaceModel): string {
        return `${model.namespace}:${model.id}`
    }

    public static makeFqn(namespace: string, id: string): string {
        return `${namespace}:${id}`
    }

    public static splitFqn(fqn: string): [string, string] {
        const split = fqn.split(":");
        return [split[0], split[1]];
    }
}
