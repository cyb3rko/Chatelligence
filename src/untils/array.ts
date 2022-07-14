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
export function top<T>(what: Array<T>, count: number, ofWhat: keyof T, highest: boolean = true): T[] {
    const sorted = [...what].sort((a, b) => a[ofWhat] < b[ofWhat] ? 1 : -1);
    if (!highest) sorted.reverse();
    sorted.length = sorted.length > count ? count : sorted.length;
    return sorted;
}
