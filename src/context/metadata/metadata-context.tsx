import { createContext, Match, Switch, useContext } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { DocPayload } from "~/network/controllers/docs/docs-interfaces";
import { MetadataStoreData } from "~/network/controllers/metadata/metadata_controller";
import { DataTypeMeta, NodeTypeMeta } from '~/wrapper/metadata/type_metadata';

// Root Meta
export interface MetaContextValue {
    metadata?: MetadataStoreData
}

const MetaContext = createContext<MetaContextValue>();
export function MetaProvider(props: { value: MetaContextValue; children: JSX.Element }) {
    return (
        <MetaContext.Provider value={props.value}>
            {props.children}
        </MetaContext.Provider>
    );
}

export function useMetaContext() {
    const ctx = useContext(MetaContext);
    if (!ctx) {
        throw new Error("useMetaContext must be inside a MetaProvider");
    }
    return ctx;
}

// Node Meta
export interface NodeMetaContextValue {
    node_meta?: NodeTypeMeta
}

const NodeMetaContext = createContext<NodeMetaContextValue>();
export function NodeMetaProvider(props: { value: NodeMetaContextValue; children: JSX.Element }) {
    return (
        <NodeMetaContext.Provider value={props.value}>
            {props.children}
        </NodeMetaContext.Provider>
    );
}

export function useNodeMetaContext() {
    const ctx = useContext(NodeMetaContext);
    if (!ctx) {
        throw new Error("useNodeMetaContext must be inside a NodeMetaProvider");
    }
    return ctx;
}

// Datatype Meta
export interface DataTypeMetaContextValue {
    datatype_meta?: DataTypeMeta
}

const DataTypeMetaContext = createContext<DataTypeMetaContextValue>();
export function DataTypeMetaProvider(props: { value: DataTypeMetaContextValue; children: JSX.Element }) {
    return (
        <DataTypeMetaContext.Provider value={props.value}>
            {props.children}
        </DataTypeMetaContext.Provider>
    );
}

export function useDataTypeMetaContext() {
    const ctx = useContext(DataTypeMetaContext);
    if (!ctx) {
        throw new Error("useDataTypeMetaContext must be inside a DataTypeMetaProvider");
    }
    return ctx;
}


export function useResolvedMeta() {
    const rootMeta = useContext(MetaContext);
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
                    <NodeMetaProvider value={{ node_meta: payload().data }}>
                        {props.children}
                    </NodeMetaProvider>
                )}
            </Match>
            <Match when={props.payload?.type === "datatype" && props.payload}>
                {(payload) => (
                    <DataTypeMetaProvider value={{ datatype_meta: payload().data }}>
                        {props.children}
                    </DataTypeMetaProvider>
                )}
            </Match>
        </Switch>
    );
}