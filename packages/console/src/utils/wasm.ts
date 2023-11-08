import { validate_tunnel_policy } from "./runtime.js";
import init from './runtime_bg.wasm?init'


export const runWasmFunction = (tunnel_policy: string, input: string) => {

    init({}).then(() => {
      console.log("tunnel eval : " + validate_tunnel_policy(tunnel_policy, input))
    });
  };
