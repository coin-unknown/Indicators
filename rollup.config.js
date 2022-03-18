import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';
import buble from 'rollup-plugin-buble';
import typescript from 'rollup-plugin-typescript2';
import nodeResolve from 'rollup-plugin-node-resolve';

export default [
    // browser-friendly UMD build
    {
        input: 'index.ts',
        output: {
            name: 'indicators',
            file: pkg.browser,
            format: 'umd',
        },
        plugins: [
            nodeResolve(),
            resolve(), // so Rollup can find `ms`
            commonjs(), // so Rollup can convert `ms` to an ES module
            typescript({
                tsconfigOverride: {
                    compilerOptions: {
                        target: 'ES5',
                        module: 'ESNext',
                    },
                },
            }),
            buble({
                transforms: { forOf: false },
                objectAssign: 'Object.assign',
                asyncAwait: false,
            }),
            terser(), // uglify
        ],
    },
    {
        input: 'index.ts',
        external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
        plugins: [
            typescript({
                tsconfigOverride: {
                    compilerOptions: {
                        target: 'ES2020',
                        module: 'ESNext',
                    },
                },
            }),
        ],
        output: [
            { file: pkg.main, format: 'cjs' },
            { file: pkg.module, format: 'es' },
        ],
    },
];
