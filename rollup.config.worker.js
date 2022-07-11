import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';

const production = !process.env.ROLLUP_WATCH;

export default {
    input: `./src/webWorker/processor.worker.ts`,
    output: {
        sourcemap: true,
        format: 'iife',
        name: 'worker',
        file: 'public/build/processor.worker.js'
    },
    plugins: [
        resolve({
			browser: true
		}),
        commonjs(),
        typescript({
            sourceMap: !production,
            inlineSources: !production
        }),
    ]
};