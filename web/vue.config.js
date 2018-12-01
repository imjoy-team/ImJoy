// vue.config.js
const path = require('path')
const webpack = require('webpack')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const CopyWebpackPlugin = require('copy-Webpack-plugin')
module.exports = {
  runtimeCompiler: true,
  outputDir: './dist',
  devServer: {
    compress: true,
    port: 8000
  },
  configureWebpack: {
    plugins: [
      // new CopyWebpackPlugin([{
      //   from: path.join(__dirname, "public/docs"),
      //   to: path.join(__dirname, "dist/docs"),
      //   toType: "dir",
      //   ignore: [ ".DS_Store" ]
      // },{
      //   from: path.join(__dirname, "public/.nojekyll"),
      //   to: path.join(__dirname, "dist/.nojekyll"),
      //   toType: "file"
      // }]),
      new MonacoWebpackPlugin(),
      new webpack.DefinePlugin({
        //bypass process check, https://github.com/Microsoft/monaco-editor-webpack-plugin/issues/28
        //TODO: remove this when the bug is fixed
        'process.platform': 0
      })
    ]
  }
}
