import { Counter } from "./Counter";
import type { Extraction } from "./processor.types";

export function emptyArray<T>(length: number, fillValue?: T): T[] {
    return new Array(length).fill(fillValue);
}

/**
 * 
 * @param what What to get the top X of.
 * @param count The maximum result length. (If the provided array length is smaller it wont be extended)
 * @param ofWhat The category to sort for.
 * @param highest Wheather lower or higher values should be on top. True for highest on top.
 * @returns 
 */
export function top<T>(what: Array<T>, count: number, offset: number, ofWhat: keyof T, highest: boolean = true): T[] {
    const sorted = [...what].sort((a, b) => a[ofWhat] < b[ofWhat] ? 1 : -1);
    if (!highest) sorted.reverse();

    return sorted.slice(offset, count + offset);
}

export const NAME_OTHER = "other";

/**
 * @param what
 * @param untouchedCount Number of ungrouped entries
 * @param name This field will be renamed to ${NAME_OTHER} on the aggregated entry
 */
export function aggregate<T extends Object>(what: Array<T>, untouchedCount: number, ofWhat: keyof T, name: keyof T, reversed: boolean, howToAggregate = (aggregation: T, entry: T) => { aggregation[ofWhat] += <any>entry[ofWhat] ?? 0 }) {
    const sorted = [...what].sort((a, b) => a[ofWhat] < b[ofWhat] ? 1 : -1);
    if (!reversed) sorted.reverse();

    if (sorted.length < untouchedCount + 1)
        return sorted;

    const top = sorted.slice(0, untouchedCount);
    const others = sorted.slice(untouchedCount);

    const aggregated = others[0];
    aggregated[name] = <any>NAME_OTHER;
    others.slice(1).forEach(entry => howToAggregate(aggregated, entry));
    top.push(aggregated);

    return top;
}

/**
 * Counts and aggregates after a certain amount.
 */
export function count<T>(inp: T[], by: keyof T) {
    let counter = new Counter<string>();

    inp.forEach((m) => {
        counter.increase(m[by as string], 1);
    });

    return counter;
}
