export type ServerMessage = 
    | { type: "node_output"; node_id: string; value: any }
    | { type: "status"; status: string; session: string }
    | { type: "handshake_sync"; type_data: any; session: string }
    | { type: "error"; message: string };

export type ClientCommand = 
    | { type: "RUN" | "STOP" | "STEP" | "RESUME" }
    | { type: "LOAD_SCENE"; payload: any }
    | { type: "SET_LOOP_STATE"; payload: { state: number } };
