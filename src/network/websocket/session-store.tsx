import { makePersisted } from '@solid-primitives/storage';
import { createStore } from 'solid-js/store';

const [storage, setStore] = makePersisted(createStore({
  "session": ""
}), {
  name: "nds"
});

export {storage, setStore}