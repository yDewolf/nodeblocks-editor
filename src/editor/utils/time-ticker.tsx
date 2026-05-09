import { createSignal } from "solid-js"

const [time, _setTime] = createSignal(Date.now());
const time_ticker = () => {
    _setTime(Date.now())
}
setInterval(time_ticker, 1000)
export {time as timeSignal}