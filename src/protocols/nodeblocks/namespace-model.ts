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
}
