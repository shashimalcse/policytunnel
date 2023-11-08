import * as wasm from "./runtime_bg.wasm";
import { __wbg_set_wasm } from "./runtime_bg.js";
__wbg_set_wasm(wasm);
export * from "./runtime_bg.js";
