export function emptyArray<T>(length: number, fillValue?: T): T[] {
    return new Array(length).fill(fillValue);
}
