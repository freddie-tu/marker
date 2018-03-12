process.env.BABEL_ENV = 'renderer'

const webpack = require('webpack');
const path = require('path');
const BabiliWebpackPlugin = require('babili-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    target: "electron-renderer",
    context: process.cwd(),
    stats: { modules: false },
    entry: {
        'view': './src/module/view/view.js',
    },
    output: {
        filename: '[name].js',
        path: path.join(process.cwd(), './dist/client/view')
    },      
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            'vue': 'vue/dist/vue.esm.js'
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
        new BabiliWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: "view.html",
            template: "./src/module/view/view.html"
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        })
    ],
    performance: {
        hints: false
    }    
};