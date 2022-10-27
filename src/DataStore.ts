import { writable } from "svelte/store";
import type { Analysis } from "./webWorker/processor.worker";

export const StoreAnalysis = writable<Analysis>();
