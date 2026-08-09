import { isServer } from "solid-js/web";

// TODO: Talvez usar o @solidjs/router para isso aq

export const getHashParams = () => {
    if (isServer) return {}

    const hash = window.location.hash.slice(1);
    const params: Record<string, string> = {};
    if (!hash) return params;

    const pairs = hash.split("&");
    for (const pair of pairs) {
        const [key, value] = pair.split("=");
        if (key) {
            params[decodeURIComponent(key)] = decodeURIComponent(value || "");
        }
    }
    return params;
};

export const setHashParam = (key: string, value: string | undefined) => {
    if (isServer) return
    const params = getHashParams();

    if (value === undefined) {
        delete params[key];
    } else {
        params[key] = value; 
    }

    const parts = Object.entries(params).map(
        ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
    );
    
    window.location.hash = parts.length > 0 ? `#${parts.join("&")}` : "";
};