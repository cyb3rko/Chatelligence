

/**
 * using an insecure hash algorithm;
 *
 * @returns hex color code
 */
export function generateColorFromString(input: string): string {
    while (input.length < 16) input += input.length.toString(36);

    var hash = Array.from(input).reduce((hash, char) => 0 | (31 * hash + char.charCodeAt(0)), 0);

    return "#" + hash.toString(16).substring(1, 7);
}