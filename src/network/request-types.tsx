export type ServerMessage = 
    | { type: "node_output"; node_id: string; value: any }
    | { type: "status"; status: string; session: string }
    | { type: "handshake_sync"; type_data: any; session: string }
    | { type: "error"; message: string }
    | { type: "sync_client_scene"; payload: any };

export type ClientCommand = 
    | { type: "RUN" | "STOP" | "STEP" | "RESUME" }
    | { type: "LOAD_SCENE"; payload: any }
    | { type: "SYNC_CLIENT_SCENE" }
    | { type: "SET_LOOP_STATE"; payload: { state: number } };
