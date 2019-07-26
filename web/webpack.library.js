const path = require('path');
// const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const {InjectManifest} = require('workbox-webpack-plugin');

module.exports = (env, argv) => {
    const options = {
        entry: path.resolve(__dirname, 'src', 'imjoyLib.js'),
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: argv.mode === 'production'?'imjoy-lib.min.js':'imjoy-lib.js',
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
                from: path.join(__dirname, "src/jailed"),
                to: path.join(__dirname, "dist/static/jailed"),
                toType: "dir"
            }]),
            new CopyWebpackPlugin([{
                    from: path.join(__dirname, "src/joy.css"),
                    to: path.join(__dirname, "dist/joy.css"),
                    toType: "file"
            }]),
            
        ]
    }
    if(argv.mode === 'production'){
        options.plugins.push(
            new InjectManifest({
                swDest: 'plugin-service-worker.js',
                swSrc: 'src/plugin-service-worker.js'
            })
        )
    }
    return options
};


