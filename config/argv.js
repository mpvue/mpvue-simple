var path = require('path')
var fs = require('fs')
var resolve = require('resolve')
var glob = require('glob')
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

// 如果有 main.js 就不找 app.vue 了，免得混乱
function searchEntry(dir, config, entryName, mpType) {
  let entryFiles = []
  searchFilters.some(filter => {
    entryFiles = glob.sync(filter, { cwd: dir })
    return entryFiles.length
  })

  if (!entryFiles || !entryFiles.length) {
    return
  }

  if (entryFiles.length === 1) {
    config.entry[entryName || path.basename(dir)] = path.resolve(dir, entryFiles[0])
    return
  }

  entryFiles.forEach((k, i) => {
    const src = path.resolve(dir, k)
    const entryPath = path.extname(src) === '.vue' ? saveEntryMain(0, src, mpType) : src
    config.entry[path.basename(dir)] = entryPath
  })
}

let argvOptions = null
let searchPath = ['./', './src', './src/pages', './mpvue-pages']
let searchFilters = ['**/**/main.js', '**/**/app.vue', '**/**/App.vue', '**/**/index.vue']

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
    entry: argvEntry,                 // ./src/main.js, ./src/app.vue, undefined
    output: argvOutput,               // pathString, undefined
    pageName: argvPageName,           // nameStrng, undefined
    component: argvComponent,         // true, undefined
    searchPath: argvSearchPath,       // pathString, undefined
    config: argvCnf,                  // pathString, undefined
    searchFilters: argvSearchFilters,
    ...resetConfig
  } = argv
  const defConfig = { entry: {}, resolve: { alias: {} } }
  const mpType = argvComponent ? 'component' : 'page'

  if (typeof argvPageName === 'string') {
    searchPath = searchPath.concat(argvPageName.split(','))
  }

  if (typeof argvSearchFilters === 'string') {
    searchFilters = argvSearchFilters,split(',')
  }

  // 为什么这里面的逻辑这么凌乱呢？
  // 可能是因为还没思考清楚吧
  if (typeof argvEntry === 'string') {
    let entryPath = resolve.sync(argvEntry, { basedir: path.resolve(), extensions: ['.js', '.vue'] })

    if (path.extname(entryPath) === '.vue') {
      entryPath = saveEntryMain(0, entryPath, mpType)
    }

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

  console.log(defConfig)

  if (!Object.keys(defConfig.entry).length) {
    throw Error('At least one entry is needed: http://mpvue.com/mpvue/simple/')
  }

  return config
}

exports.injectArgvOptions = injectArgvOptions
exports.mergeArgvConfig = mergeArgvConfig
