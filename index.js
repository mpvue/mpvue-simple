const injectArgvOptions = require('./config/argv').injectArgvOptions

function build (argvOptions) {
  injectArgvOptions(argvOptions)
  return require('./build/build.js')
}

function devServer (argvOptions) {
  injectArgvOptions(argvOptions)
  return require('./build/dev-server.js')
}

exports.build = build
exports.devServer = devServer
exports.getWebpackConfig = function () {
  return require('./build/webpack.prod.conf')
}
exports.getDevWebpackConfig = function () {
  require('./build/webpack.dev.conf')
}
