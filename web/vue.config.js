// vue.config.js
const path = require('path')
const webpack = require('webpack')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
module.exports = {
  runtimeCompiler: true,
  outputDir: './dist',
  devServer: {
    compress: true,
    port: 8000
  },
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin([{
        from: path.join(__dirname, "public/docs/index.html"),
        to: path.join(__dirname, "dist/docs/index.html"),
        toType: "file"
      }]),
      new MonacoWebpackPlugin(),
      new webpack.DefinePlugin({
        //bypass process check, https://github.com/Microsoft/monaco-editor-webpack-plugin/issues/28
        //TODO: remove this when the bug is fixed
        'process.platform': 0
      })
    ]
  }
}
