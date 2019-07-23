const path = require('path');
// const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    entry: path.resolve(__dirname, 'src', 'imjoyLib.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'imjoy-lib.js',
        library: 'imjoyLib',
        libraryTarget:'umd'
    },
    resolve: {
        extensions: ['.js']
    },
	module: {
        rules: [
        ]
    },
    plugins: [
        new CopyWebpackPlugin([{
                from: path.join(__dirname, "public/demo.html"),
                to: path.join(__dirname, "dist/demo.html"),
                toType: "file"
            }
        ]),
        new CopyWebpackPlugin([{
            from: path.join(__dirname, "src/jailed"),
            to: path.join(__dirname, "dist/static/jailed"),
            toType: "dir"
        }])
    ]
};