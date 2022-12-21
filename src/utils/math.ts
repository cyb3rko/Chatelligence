export function round(num: number, decimals: number) {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function toPercent(num: number, decimals: number) {
    return round(num * 100, decimals);
}