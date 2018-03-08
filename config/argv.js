var path = require('path')
var fs = require('fs')
// const { NpmAutoInstallWebpackPlugin } = require('npm-auto-install-webpack-plugin')

function saveEntryMain(index, src, mpType) {
  const content = `import Vue from 'vue'
import App from '${src}'
Vue.config.productionTip = false
App.mpType = '${mpType}'
const app = new Vue(App)
app.$mount()
${ mpType === 'component' ? `
export default {
  config: {
    component: true
  }
}` : '' }
`

  const fileSrc = path.resolve(__dirname, `../src/main${index}.js`)
  fs.writeFileSync(fileSrc, content)
  return fileSrc
}

function searchEntry(dir, config, entryName, mpType) {
  if (!fs.existsSync(dir)) {
    return
  }

  const files = fs.readdirSync(dir)
  if (files.includes('main.js')) {
    config.entry[entryName || path.basename(dir)] = path.resolve(dir, 'main.js')
    return
  }

  files.forEach((k, i) => {
    const page = path.resolve(dir, k)
    if (fs.existsSync(page) && searchFileFilter.some(f => f.test(page))) {
      config.entry[entryName || path.parse(page).name] = saveEntryMain(i, page, mpType)
    }
  })
}

let argvOptions = null
let searchPath = ['./', './src', './src/pages', './mpvue-pages']
let searchFileFilter = [/.*?\.vue$/, /main\.js/]
function injectArgvOptions (options) {
  argvOptions = options
}

function mergeArgvConfig (config) {
  // 默认初始化
  config.argvConfig = {
    // plugins: [
    //   new NpmAutoInstallWebpackPlugin()
    // ]
  }

  // 拼接自定义的参数
  var argv = Object.assign({}, argvOptions, require('yargs').argv)
  const {
    entry: argvEntry,
    output: argvOutput,
    config: argvCnf,
    pageName: argvPageName,
    searchPath: argvSearchPath,
    component: argvComponent,
    ...resetConfig
  } = argv
  const defConfig = { entry: {}, resolve: { alias: {} } }
  const mpType = argvComponent ? 'component' : 'page'

  if (typeof argvPageName === 'string') {
    searchPath = searchPath.concat(argvPageName.split(','))
  }

  if (typeof argvEntry === 'string') {
    const entryPath = path.resolve(argvEntry)
    if (typeof argvPageName === 'string') {
      const entryName = argvPageName || path.parse(entryPath).name
      defConfig.entry[entryName] = entryPath
    } else if (fs.existsSync(entryPath)) {
      defConfig.entry[path.parse(entryPath).name] = entryPath
    } else {
      searchEntry(entryPath, defConfig, argvPageName, mpType)
    }
  } else {
    searchPath.forEach(s => {
      searchEntry(path.resolve(s), defConfig, argvPageName, mpType)
    })
  }

  if (argvOutput) {
    const assetsRoot = path.resolve(argvOutput)
    defConfig.assetsRoot = assetsRoot
  }

  if (typeof argvCnf === 'string') {
    try {
      config.argvConfig = require('webpack-merge')(config.argvConfig, require(path.resolve(argvCnf)))
    } catch (e) { }
  }

  Object.assign(config.build, resetConfig, defConfig)
  Object.assign(config.dev, resetConfig, defConfig)

  return config
}

exports.injectArgvOptions = injectArgvOptions
exports.mergeArgvConfig = mergeArgvConfig
