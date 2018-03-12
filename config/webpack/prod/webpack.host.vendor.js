process.env.BABEL_ENV = 'main'

const webpack = require('webpack');
const path = require('path');

module.exports= {
    target: 'electron-main',
    resolve: { extensions: [ '.js' ] },
    entry: {
        vendor: [
            'rxjs/Subject',
            'rxjs/Observable',
            'typescript-ioc',
            'marked',
            'katex'
        ]
    },
    externals: [
        "fs"
    ],
    output: {
        filename: '[name].js',
        path: path.join(process.cwd(), './dist'),
        library: '[name]_[hash]',
        libraryTarget: "commonjs2"
    },
    plugins: [        
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.DllPlugin({
            context: __dirname,
            path: path.join(process.cwd(), 'dist', 'manifest.json'),
            name: '[name]_[hash]'
        })
    ]
}
