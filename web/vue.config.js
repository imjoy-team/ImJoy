// vue.config.js
const path = require('path')
const webpack = require('webpack')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CnameWebpackPlugin = require('cname-webpack-plugin')
const CreateFileWebpack = require('create-file-webpack')
const package_json = require('./package.json')

const version_file = {
  // path to folder in which the file will be created
  path: path.join(__dirname, "dist"),
  // file name
  fileName: 'version.json',
  // content of the file
  content: `{"name": "${package_json.name}", "version": "${package_json.version}", "description": "${package_json.description}"}`
};

module.exports = {
  runtimeCompiler: true,
  outputDir: './dist',
  assetsDir: 'static',
  devServer: {
    compress: true,
    port: 8000
  },
  pwa: {
      // configure the workbox plugin
      workboxPluginMode: 'InjectManifest',
      workboxOptions: {
          // swSrc is required in InjectManifest mode.
          swSrc: 'src/service-worker.js',
          exclude: [new RegExp('^[\.].*')]
      }
  },
  configureWebpack: {
    devtool: 'source-map',
    module: {
      // for supressing webpack warnings
      exprContextCritical: false
    },
    plugins: [
      new CreateFileWebpack(version_file),
      new CnameWebpackPlugin({
        domain: process.env.DEPLOY_MODE === 'dev' ? 'dev.imjoy.io' : 'imjoy.io',
      }),
      new CopyWebpackPlugin([{
        from: path.join(__dirname, "../docs"),
        to: path.join(__dirname, "dist/docs"),
        toType: "dir"
      },{
        from: path.join(__dirname, "../repo"),
        to: path.join(__dirname, "dist/repo"),
        toType: "dir"
      },{
        from: path.join(__dirname, "src/pluginParser.js"),
        to: path.join(__dirname, "dist/static/js/pluginParser.js"),
        toType: "file"
      },{
        from: path.join(__dirname, "public/.nojekyll"),
        to: path.join(__dirname, "dist"),
        toType: "dir"
      }]),
      new MonacoWebpackPlugin({output: 'static/vs', languages: ['javascript', 'html', 'css', 'python'], features: ['accessibilityHelp', 'bracketMatching', 'caretOperations', 'clipboard', 'codeAction', 'codelens', 'colorDetector', 'comment', 'contextmenu', 'coreCommands', 'cursorUndo', 'dnd', 'find', 'folding', 'fontZoom', 'format', 'goToDefinitionCommands', 'goToDefinitionMouse', 'gotoError', 'gotoLine', 'hover', 'inPlaceReplace', 'inspectTokens', 'iPadShowKeyboard', 'linesOperations', 'links', 'multicursor', 'parameterHints', 'quickCommand', 'quickOutline', 'referenceSearch', 'rename', 'smartSelect', 'snippets', 'suggest', 'toggleHighContrast', 'toggleTabFocusMode', 'transpose', 'wordHighlighter', 'wordOperations', 'wordPartOperations']}),
      new webpack.DefinePlugin({
        //bypass process check, https://github.com/Microsoft/monaco-editor-webpack-plugin/issues/28
        //TODO: remove this when the bug is fixed
        'process.platform': 0
      })
    ]
  },
  chainWebpack: config => {
    config.module
      .rule('imjoy')
      .oneOf('vue')
      .test(/\.imjoy.html$/)
      .use('raw-loader')
      .loader('raw-loader')
  },
  pluginOptions: {
    karma: {
      karmaConfig: {
        frameworks: ['mocha'],
        files: [
          'tests/*.spec.js',
        ],
        preprocessors: {
          '**/*.spec.js': ['webpack', 'sourcemap']
        },

        browsers: ['ChromeHeadlessNoSandbox', 'FirefoxHeadless'],

        customLaunchers: {
          ChromeHeadlessNoSandbox: {
            base: 'ChromeHeadless',
            flags: ["--no-sandbox"]
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
        concurrency: Infinity,

        captureTimeout: 60000,
        browserDisconnectTolerance: 2,
        browserDisconnectTimeout : 60000,
        browserNoActivityTimeout : 60000,
      }
    }
  }
}
