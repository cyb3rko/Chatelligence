export class Counter<T> extends Map<T, number> {
    constructor(keys?: T[]) {
        super(keys?.map(k => [k, 0]));
    }

    increase(key: T, amount?: number) {
        let value = (this.get(key) ?? 0) + (amount ?? 1);
        this.set(key, value);
        return value;
    }

    decrease(key: T, amount?: number) {
        this.increase(key, -(amount ?? 1));
    }
}