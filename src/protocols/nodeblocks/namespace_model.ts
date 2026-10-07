export interface NamespaceModel {
    namespace: string
    id: string
}

export class NamespaceUtils {
    public fqn(model: NamespaceModel): string {
        return model.namespace + ":" + model.id
    }
}