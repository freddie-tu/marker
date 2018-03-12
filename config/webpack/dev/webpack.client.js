process.env.BABEL_ENV = 'renderer'

const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    target: "electron-renderer",
    devtool: 'source-map', 
    context: process.cwd(),
    stats: { modules: false },
    entry: {
        'client': './src/client/index.js',
    },
    output: {
        filename: '[name].js',
        path: path.join(process.cwd(), './dist/client'),
        devtoolModuleFilenameTemplate: '[absolute-resource-path]'
    },      
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            //'vue': 'vue/dist/vue.common.js'
            'vue': 'vue/dist/vue.js'
        }
    },     
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        'scss': 'vue-style-loader!css-loader!sass-loader',
                        'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax'
                    }
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
        ]
    },
    plugins:[
        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require(path.join(process.cwd(), './dist/client/manifest.json'))
        }),
        new HtmlWebpackPlugin({
            template: "./config/webpack/dev/index.html"
        }),
    ],
    performance: {
        hints: false
    }    
};