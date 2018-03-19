var path = require('path')
var fs = require('fs')
var util = require('util')
var resolve = require('resolve')
var glob = require('glob')
var webpack = require('webpack')
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

function resolveEntry (src, cwd) {
  try {
    return resolve.sync(src, { basedir: cwd })
  } catch (err) {
    // console.log(err)
  }
  return ''
}

// 如果有 main.js 就不找 app.vue 了，免得混乱
function searchEntry(pattern, entryName, cwd, config) {
  const entryFiles = glob.sync(pattern, { cwd })
  if (!entryFiles.length) {
    return false
  }

  if (entryFiles.length === 1) {
    const realSrc = path.resolve(cwd, entryFiles[0])
    config.entry[getEntryName(realSrc, entryName)] = realSrc
    return true
  }

  entryFiles.forEach((k, i) => {
    const src = path.resolve(cwd, k)
    config.entry[getEntryName(src)] = src
  })

  return true
}

function getEntryName (src, pageName) {
  if (pageName) {
    return pageName
  }
  const { dir, name } = path.parse(src)
  if (['app', 'App', 'main', 'index'].includes(name)) {
    return path.parse(dir).name
  }
  return name
}

// 暂时只想到这么做缓存
let argvOptions = null
function injectArgvOptions (options) {
  argvOptions = options
}

// 默认优先为完整路径的单文件
// 其次是 glob 格式扫描到的文件
// 其次是 node.js 本地运行时传递的 object
// 再次是一个路径下，默认扫描
// 最后才是默认路径，默认扫描
// component 针对所有扫描到的 .vue SFC entry 才有用
// 有且只有一个 entry 的时候 pageName 才有效
function mergeArgvConfig (config) {
  // 默认初始化
  const cwd = path.resolve()
  const defConfig = { entry: {}, resolve: { alias: {} } }
  const floders = ['./src/', './mpvue-pages/']
  const searchFilters = ['./**/**/main.js', './**/**/app.vue', './**/**/App.vue', './**/**/index.vue']
  config.argvConfig = {
    plugins: [
      // new NpmAutoInstallWebpackPlugin()
    ]
  }

  // 拼接自定义的参数
  var argv = Object.assign({}, argvOptions, require('yargs').argv)
  const {
    entry: argvEntry,                 // ./src/main.js, ./src/app.vue, ./src/, ./src/**/main.js, { page: './page/main.js' }, undefined
    pageName: argvPageName,           // nameStrng, undefined
    component: argvComponent,         // true, undefined
    output: argvOutput,               // pathString, undefined
    config: argvCnf,                  // pathString, undefined
    definePlugin: argvDefinePlugin,   // object, undefined
    ...resetConfig
  } = argv
  const mpType = argvComponent ? 'component' : 'page'

  // 开始获取 entry
  if (typeof argvEntry === 'string') {
    // 首先判断是不是完整路径
    const curEntry = resolveEntry(argvEntry, cwd)
    // const absEntry = path.resolve(argvEntry)
    if (curEntry) {
      defConfig.entry[getEntryName(curEntry, argvPageName)] = curEntry
    } else {
      // 先检查是否是 glob 格式的 filter
      // 再检查这是不是路径
      if (!searchEntry(argvEntry, argvPageName, cwd, defConfig)) {
        floders.unpop()
      }
    }
  } else if (util.isObject(argvEntry)) {
    defConfig.entry = argvEntry
  } else {
    const allPattern = floders.reduce((r, floder) => {
      return r.concat(searchFilters.map(v => path.join(floder, v)))
    }, [])
    allPattern.some(pattern => {
      return searchEntry(pattern, argvPageName, cwd, defConfig)
    })
  }

  // 输出文件夹
  if (argvOutput) {
    const assetsRoot = path.resolve(argvOutput)
    defConfig.assetsRoot = assetsRoot
  }

  const allEntry = Object.keys(defConfig.entry)

  if (!allEntry.length) {
    throw Error('At least one entry is needed: http://mpvue.com/mpvue/simple/')
  }

  // 处理 component 和 .vue 的 entry
  allEntry.forEach((v, i) => {
    if (path.extname(v) === '.vue') {
      defConfig.entry[v] = saveEntryMain(i, v, mpType)
    }
  })

  // DefinePlugin
  if (argvDefinePlugin) {
    config.argvConfig.plugins.push(new webpack.DefinePlugin(argvDefinePlugin))
  }

  // 合并自定义 webpack config
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
