process.env.BABEL_ENV = 'main'

const webpack = require('webpack')
const path = require('path')
const { dependencies } = require('../../../package.json')
const { CheckerPlugin } = require('awesome-typescript-loader')

module.exports = {
    devtool: 'source-map', 
    target: 'electron-main',
    context: process.cwd(),
    stats: { modules: false },
    entry: {
        'main': './src/host/main.ts',
    },
    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        path: path.join(process.cwd(), './dist'),
        devtoolModuleFilenameTemplate: '[absolute-resource-path]'
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
        new CheckerPlugin(),
        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require(path.join(process.cwd(), './dist/manifest.json')),
            name: "./vendor.js",
            sourceType: "commonjs2"
        })
    ],
    node: {
        __dirname: false,
        __filename: false,
    }
}