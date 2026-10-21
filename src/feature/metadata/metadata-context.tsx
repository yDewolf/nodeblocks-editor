import { createContext, Match, Switch, useContext } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { DocPayload } from "~/feature/docs/docs-protocols";
import { MetadataController, MetadataStoreData } from "~/feature/metadata/metadata_controller";
import { NodeTypeMeta, DataTypeMeta } from "~/protocols/nodeblocks/metadata/type_metadata";

const MetadataContext = createContext<MetadataController>();
export function MetadataProvider(props: { controller: MetadataController, children: JSX.Element; }) {
    return (
        <MetadataContext.Provider value={props.controller}>
            {props.children}
        </MetadataContext.Provider>
    );
}

export function useMetadata() {
    const context = useContext(MetadataContext);
    if (!context) {
        throw new Error("Not inside a '<MetadataProvider/>'");
    }
    return context;
}

// Root Meta
export interface PackageMetaContextValue {
    metadata?: MetadataStoreData
}

const PackageMetaContext = createContext<PackageMetaContextValue>();
export function MetaProvider(props: { value: PackageMetaContextValue; children: JSX.Element }) {
    return (
        <PackageMetaContext.Provider value={props.value}>
            {props.children}
        </PackageMetaContext.Provider>
    );
}

export function usePackageMetaContext() {
    const ctx = useContext(PackageMetaContext);
    if (!ctx) {
        throw new Error("useMetaContext must be inside a MetaProvider");
    }
    return ctx;
}

// Node Meta
interface NodeTypeMetaContext {
    meta?: NodeTypeMeta,
    package_id?: string,
    type_id?: string
}

const NodeMetaContext = createContext<NodeTypeMetaContext | undefined>();
export function NodeMetaProvider(props: { value?: NodeTypeMeta, package_id?: string, type_id?: string; children: JSX.Element }) {
    return (
        <NodeMetaContext.Provider value={{meta: props.value, package_id: props.package_id, type_id: props.type_id}}>
            {props.children}
        </NodeMetaContext.Provider>
    );
}

export function useNodeMeta() {
    const ctx = useContext(NodeMetaContext);
    return ctx;
}

// Datatype Meta
const DataTypeMetaContext = createContext<DataTypeMeta | undefined>();
export function DataTypeMetaProvider(props: { value?: DataTypeMeta; children: JSX.Element }) {
    return (
        <DataTypeMetaContext.Provider value={props.value}>
            {props.children}
        </DataTypeMetaContext.Provider>
    );
}

export function useDataTypeMetaContext() {
    const ctx = useContext(DataTypeMetaContext);
    return ctx;
}


export function useResolvedMeta() {
    const rootMeta = useContext(PackageMetaContext);
    const nodeMeta = useContext(NodeMetaContext);
    const dataTypeMeta = useContext(DataTypeMetaContext);

    return {
        rootMeta,
        nodeMeta,
        dataTypeMeta,
        activeMeta: nodeMeta || dataTypeMeta || rootMeta
    };
}

export function DynamicMetaProvider(props: { payload?: DocPayload; children: JSX.Element }) {
    return (
        <Switch fallback={props.children}>
            <Match when={props.payload?.type === "node" && props.payload}>
                {(payload) => (
                    // TODO: fix this meta provider
                    <NodeMetaProvider value={payload().data}>
                        {props.children}
                    </NodeMetaProvider>
                )}
            </Match>
            <Match when={props.payload?.type === "datatype" && props.payload}>
                {(payload) => (
                    <DataTypeMetaProvider value={payload().data}>
                        {props.children}
                    </DataTypeMetaProvider>
                )}
            </Match>
        </Switch>
    );
}