export type ForcedNetworkGraphInput = {
    nodes: {
        id: string;
        group: number;
        color: string;
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