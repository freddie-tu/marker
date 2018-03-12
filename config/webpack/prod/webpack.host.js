process.env.BABEL_ENV = 'main'

const webpack = require('webpack')
const path = require('path')
const { dependencies } = require('../../../package.json')
const { CheckerPlugin } = require('awesome-typescript-loader')
const BabiliWebpackPlugin = require('babili-webpack-plugin')

module.exports = {
    target: 'electron-main',
    context: process.cwd(),
    stats: { modules: false },
    entry: {
        'main': './src/host/main.ts',
    },
    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        path: path.join(process.cwd(), './dist')
    },
    externals: [
        ...Object.keys(dependencies || {})
    ],
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader?' + JSON.stringify({
                    configFileName: 'tsconfig.json',
                    silent: true
                }),
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                  {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]'
                    }  
                  }
                ]
              }
        ]
    },
    plugins: [
        /*
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        */
        new CheckerPlugin(),
        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require(path.join(process.cwd(), './dist/manifest.json')),
            name: "./vendor.js",
            sourceType: "commonjs2"
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new BabiliWebpackPlugin({
            keepClassName: true,
            keepFnName: true

        })
    ],
    node: {
        __dirname: false,
        __filename: false,
    }
}