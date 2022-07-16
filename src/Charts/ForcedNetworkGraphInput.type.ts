export type ForcedNetworkGraphInput = {
    nodes: {
        id: string;
        group: number;
    }[];
    links: {
        source: string;
        target: string;
        value: number;
        /**
         * The original calculated value
         */
        _value: number;
    }[];
}