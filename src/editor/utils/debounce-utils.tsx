
export const debounce = (func: Function, wait: number) => {
    let timeout: any;
    return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};


export const throttle = (callback: Function, limit: number) => {
    let waiting = false;
    return (...args: any[]) => {
        if (!waiting) {
            callback(...args);
            waiting = true;
            setTimeout(() => {
                waiting = false;
            }, limit);
        }
    };
};