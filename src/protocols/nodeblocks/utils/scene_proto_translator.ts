import { nodeblocks } from '~/protocols/nodeblocks/generated/proto';
import { NodeExecutionStatus, JobStatus } from '../engine/engine-status-protocols';
import { CommandStatus } from '../engine/server-ipc-event-protocol';
import { WorkerEventTypes } from '../engine/worker-event-types';
import { DefaultDataTypes } from '../manifests/node/datatype-enums';
import { SerializedDataTypeValue } from '../manifests/node/datatype-value-meta';
import { ConnectionSceneData, NodeSceneData, SceneData } from '../manifests/node/node-graph-data';
import { EngineEventPayload, NodeStatusPayload, JobStatusPayload, FailedProcessPayload, RuntimeErrorPayload } from '../network/message/server/payloads/engine-event-payloads';
import { ServerCmdResponsePayload, GetSceneDataPayload, ExecutionStateSyncPayload, AddNodePayload, AddConnPayload } from '../network/message/server/payloads/server-response-payloads';
import { WorkerEventPayload } from '../network/message/server/payloads/worker-event-payloads';
import { ServerSceneMessages } from '../network/message/server/server-scene-messages';
import { ServerCmdResponseTypes, ServerEngineEventTypes, ServerMessageTypes } from '../network/server-message-protocol';


export class SceneProtoTranslator {
    public static decodeServerMessage(buffer: Uint8Array): ServerSceneMessages | null {
        try {
            const decodedWrapper = nodeblocks.api.v1.ServerMessageWrapper.decode(buffer);
            const mapped = this.mapWrapperToClientMessage(decodedWrapper);
            console.log(mapped)
            return mapped;

        } catch (error) {
            console.error("Failed to decode protobuf coming from server. ", error);
            return null;
        }
    }

    private static mapWrapperToClientMessage(wrapper: any): ServerSceneMessages | null {
        switch (wrapper.type) {
            case nodeblocks.api.v1.ProtoServerMessageTypes.SCENE_EVENT:
            case 0:
                return {
                    type: ServerMessageTypes.SCENE_EVENT,
                    event_payload: this.mapWorkerEvent(wrapper.sceneEvent?.eventPayload)
                } as any;

            case nodeblocks.api.v1.ProtoServerMessageTypes.GRAPH_EVENT:
            case 1:
                return {
                    type: ServerMessageTypes.GRAPH_EVENT,
                    event_payload: this.mapEngineEvent(wrapper.graphEvent?.eventPayload)
                } as any;

            case nodeblocks.api.v1.ProtoServerMessageTypes.COMMAND_RESPONSE:
            case 2:
                return {
                    type: ServerMessageTypes.COMMAND_RESPONSE,
                    cmd_uid: wrapper.cmdResponse?.cmdUid,
                    response_payload: this.mapCmdResponse(wrapper.cmdResponse?.responsePayload)
                } as any;

            case nodeblocks.api.v1.ProtoServerMessageTypes.BATCH:
            case 3:
                return {
                    type: ServerMessageTypes.BATCH,
                    messages: wrapper.batch?.messages?.map((item: any) => {
                        if (item.sceneEvent) {
                            return {
                                type: ServerMessageTypes.SCENE_EVENT,
                                event_payload: this.mapWorkerEvent(item.sceneEvent.eventPayload)
                            };
                        }
                        if (item.graphEvent) {
                            return {
                                type: ServerMessageTypes.GRAPH_EVENT,
                                event_payload: this.mapEngineEvent(item.graphEvent.eventPayload)
                            };
                        }
                        if (item.cmdResponse) {
                            return {
                                type: ServerMessageTypes.COMMAND_RESPONSE,
                                cmd_uid: item.cmdResponse.cmdUid,
                                response_payload: this.mapCmdResponse(item.cmdResponse.responsePayload)
                            };
                        }
                        return null;
                    }).filter(Boolean) || []
                } as any;

            default:
                console.warn("Unknown protobuf type: ", wrapper);
                return null;
        }
    }

    private static mapWorkerEvent(protoWorker: nodeblocks.api.v1.WorkerEventMessage): WorkerEventPayload {
        let type = WorkerEventTypes.READY;
        if (protoWorker.type === nodeblocks.api.v1.ProtoWorkerEventType.STOPPED) type = WorkerEventTypes.STOPPED;
        if (protoWorker.type === nodeblocks.api.v1.ProtoWorkerEventType.FATAL_ERROR) type = WorkerEventTypes.FATAL_ERROR;

        return {
            type,
            error: protoWorker.error
        } as WorkerEventPayload;
    }

    private static mapCmdResponse(protoCmd: nodeblocks.api.v1.ServerCmdResponseMessage): ServerCmdResponsePayload {
        const type = protoCmd.type;
        const statusPack = {
            status: protoCmd.status?.status === "successful" ? CommandStatus.SUCCESSFUL : CommandStatus.FAILED,
            message: protoCmd.status?.message
        };

        const basePayload = {
            type,
            request_id: protoCmd.requestId,
            status: statusPack
        };

        if (type === ServerCmdResponseTypes.GET_SCENE_DATA) {
            let sceneData: SceneData | undefined = undefined;
            if (protoCmd.getSceneData?.sceneData) {
                sceneData = this.mapSceneData(protoCmd.getSceneData.sceneData);
            }

            return {
                ...basePayload,
                scene_data: sceneData
            } as GetSceneDataPayload;
        }

        if (type === ServerCmdResponseTypes.EXECUTION_STATE_SYNC) {
            return {
                ...basePayload,
                state: protoCmd.executionStateSync?.state,
                mode: protoCmd.executionStateSync?.mode,
                target_iterations: protoCmd.executionStateSync?.targetIterations,
                target_nodes: protoCmd.executionStateSync?.targetNodes
            } as ExecutionStateSyncPayload;
        }

        if (type === ServerCmdResponseTypes.ADD_NODE) {
            return {
                ...basePayload,
                nodes: protoCmd.addNode?.nodes
            } as AddNodePayload;
        }

        if (type === ServerCmdResponseTypes.ADD_CONN) {
            return {
                ...basePayload,
                conns: protoCmd.addConn?.conns
            } as AddConnPayload;
        }

        return basePayload as ServerCmdResponsePayload;
    }

    private static mapSceneData(protoScene: nodeblocks.protocols.v1.data.SceneDataMessage): SceneData {
        const nodes: Record<string, NodeSceneData> = {};
        if (protoScene.nodes) {
            for (const [key, val] of Object.entries(protoScene.nodes)) {
                const node: nodeblocks.protocols.v1.data.NodeSceneDataMessage = val;
                nodes[key] = {
                    uid: node.uid,
                    nodetype_fqn: node.nodetypeFqn,
                    position: { x: node.position?.x || 0, y: node.position?.y || 0 },
                    data: node.data ? Object.fromEntries(
                        Object.entries(node.data).map(([k, v]) => {
                            try { return [k, JSON.parse(v as string)]; }
                            catch { return [k, v]; }
                        })
                    ) : {}
                };
            }
        }

        const connections: Record<string, ConnectionSceneData> = {};
        if (protoScene.connections) {
            for (const [key, val] of Object.entries(protoScene.connections)) {
                const conn: nodeblocks.protocols.v1.data.ConnectionSceneDataMessage = val;
                connections[key] = {
                    uid: conn.uid,
                    from_slot: {
                        node_id: conn.fromSlot!.nodeId!,
                        slot_id: conn.fromSlot!.slotId!
                    },
                    to_slot: {
                        node_id: conn.toSlot!.nodeId!,
                        slot_id: conn.toSlot!.slotId!
                    }
                };
            }
        }

        return {
            uid: protoScene.uid,
            dependencies: protoScene.dependencies || {},
            nodes,
            connections
        };
    }

    private static mapEngineEvent(protoEvent: nodeblocks.api.v1.EngineEventMessage): EngineEventPayload {
        const jobId = protoEvent.jobId;
        const tracker = protoEvent.trackerJson ? JSON.parse(protoEvent.trackerJson) : {};
        const type = protoEvent.type;

        if (type === nodeblocks.api.v1.ProtoEngineEventType.NODE_STATUS || protoEvent.nodeStatus) {
            const ns = protoEvent.nodeStatus;
            const nodeResult: Record<string, SerializedDataTypeValue> = {};
            
            if (ns?.nodeResult) {
                for (const [k, v] of Object.entries(ns.nodeResult)) {
                    nodeResult[k] = this.mapSerializedDataTypeValue(v);
                }
            }

            return {
                type: ServerEngineEventTypes.NODE_STATUS,
                job_id: jobId,
                tracker,
                node_uid: ns?.nodeUid,
                status: ns?.status as NodeExecutionStatus,
                node_result: nodeResult
            } as NodeStatusPayload;
        }

        if (type === nodeblocks.api.v1.ProtoEngineEventType.JOB_STATUS || protoEvent.jobStatus) {
            return {
                type: ServerEngineEventTypes.JOB_STATUS,
                job_id: jobId,
                tracker,
                status: protoEvent.jobStatus?.status as JobStatus
            } as JobStatusPayload;
        }

        if (type === nodeblocks.api.v1.ProtoEngineEventType.FAILED_PROCESS || protoEvent.failedProcess) {
            return {
                type: ServerEngineEventTypes.FAILED_PROCESS,
                job_id: jobId,
                tracker,
                error: protoEvent.failedProcess?.error
            } as FailedProcessPayload;
        }

        if (type === nodeblocks.api.v1.ProtoEngineEventType.RUNTIME_ERROR || protoEvent.runtimeError) {
            return {
                type: ServerEngineEventTypes.RUNTIME_ERROR,
                job_id: jobId,
                tracker,
                message: protoEvent.runtimeError?.message
            } as RuntimeErrorPayload;
        }

        return {
            type: ServerEngineEventTypes.RUNTIME_ERROR,
            job_id: jobId,
            tracker,
            message: "Unknown Engine Event"
        } as RuntimeErrorPayload;
    }

    private static mapSerializedDataTypeValue(protoVal: nodeblocks.protocols.v1.data.SerializedDataTypeValueMessage): SerializedDataTypeValue {
        let actualValue: any = null;
        if (protoVal.value) {
            if (protoVal.value.stringValue != undefined) actualValue = protoVal.value.stringValue;
            else if (protoVal.value.intValue != undefined) actualValue = protoVal.value.intValue;
            else if (protoVal.value.floatValue != undefined) actualValue = protoVal.value.floatValue;
            else if (protoVal.value.boolValue != undefined) actualValue = protoVal.value.boolValue;
            else if (protoVal.value.jsonSerializedValue != undefined) {
                try { actualValue = JSON.parse(protoVal.value.jsonSerializedValue); }
                catch { actualValue = protoVal.value.jsonSerializedValue; }
            }
        }

        let valueMeta: any = undefined;
        if (protoVal.metadata) {
            const meta = protoVal.metadata;
            let dataType = DefaultDataTypes.UNKNOWN;
            dataType = meta.type as DefaultDataTypes;

            if (meta.arrayMetadata) {
                valueMeta = {
                    type: dataType,
                    shape: meta.arrayMetadata.shape || [],
                    min: meta.arrayMetadata.min,
                    max: meta.arrayMetadata.max
                };
            } else if (meta.fileMetadata) {
                valueMeta = {
                    type: dataType,
                    is_artifact: meta.fileMetadata.isArtifact
                };
            }
        }

        return {
            value: actualValue,
            value_meta: valueMeta
        };
    }
}