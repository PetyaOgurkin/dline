import babel from 'rollup-plugin-babel';
import minify from 'rollup-plugin-babel-minify';

export default {
    input: 'src/index.js',
    output: [
        {
            file: 'dist/dline.js',
            format: 'umd',
            name: 'dline'
        },
        {
            file: 'dist/dline.min.js',
            format: 'umd',
            name: 'dline',
            plugins: [minify({
                comments: false
            })]
        }
    ],
    plugins: [
        babel({
            exclude: 'node_modules/**',
        })
    ]
};