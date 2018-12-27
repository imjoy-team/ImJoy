// vue.config.js
const path = require('path')
const webpack = require('webpack')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
module.exports = {
  runtimeCompiler: true,
  outputDir: './dist',
  assetsDir: 'static',
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
      new MonacoWebpackPlugin({output: 'static/vs'}),
      new webpack.DefinePlugin({
        //bypass process check, https://github.com/Microsoft/monaco-editor-webpack-plugin/issues/28
        //TODO: remove this when the bug is fixed
        'process.platform': 0
      })
    ]
  },
  pluginOptions: {
    karma: {
      karmaConfig: {
        frameworks: ['mocha'],
        files: [
          'tests/unit/*.spec.js'
        ],
        preprocessors: {
          '**/*.spec.js': ['webpack', 'sourcemap']
        },

        browsers: ['ChromeNoSandbox', 'Firefox'],

        customLaunchers: {
          ChromeNoSandbox: {
            base: 'Chrome',
            flags: ['--no-sandbox']
          }
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
      }
    }
  }
}