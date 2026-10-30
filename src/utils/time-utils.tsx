import { createSignal } from "solid-js"

const [time, _setTime] = createSignal(Date.now());
const time_ticker = () => {
    _setTime(Date.now())
}
setInterval(time_ticker, 1000)

// TODO: Make a better way of handling unix time and time zones
export function unixToDate(unix_time: number): string {
    const date = new Date(unix_time * 1000); 
    const pad = (num: number): string => String(num).padStart(2, '0');

    const dd = pad(date.getDate());
    const mm = pad(date.getMonth() + 1);
    const yyyy = date.getFullYear();

    const HH = pad(date.getHours());
    const MM = pad(date.getMinutes());
    const SS = pad(date.getSeconds());

    return `${mm}-${dd}-${yyyy} ${HH}:${MM}:${SS}`;
}
export {time as timeSignal}