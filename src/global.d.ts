/// <reference types="@solidjs/start/env" />

declare module "*.svg" {
  import { Component, ComponentProps } from "solid-js";
  const src: Component<ComponentProps<"svg">>;
  export default src;
}