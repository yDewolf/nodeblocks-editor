import { makePersisted } from '@solid-primitives/storage';
import { createStore } from 'solid-js/store';

const [sessionStorage, setSession] = makePersisted(createStore({
  "session": "",
  "username": ""
}), {
  name: "nds"
});

export {sessionStorage as sessionStorage, setSession as setStore}