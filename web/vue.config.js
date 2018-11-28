// vue.config.js
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const webpack = require('webpack')
module.exports = {
  runtimeCompiler: true,
  outputDir: '../docs',
  devServer: {
    compress: true,
    port: 8000
  },
  configureWebpack: {
    plugins: [
      new MonacoWebpackPlugin(),
      new webpack.DefinePlugin({
        //bypass process check, https://github.com/Microsoft/monaco-editor-webpack-plugin/issues/28
        //TODO: remove this when the bug is fixed
        'process.platform': 0
      })
    ]
  }
}
