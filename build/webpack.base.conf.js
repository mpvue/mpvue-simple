var path = require('path')
var fs = require('fs')
var utils = require('./utils')
var config = require('../config')
var vueLoaderConfig = require('./vue-loader.conf')

// 建议直接使用path.resolve函数
function resolve (dir) {
  return path.resolve(dir)
}

const entry = process.env.NODE_ENV === 'production'
  ? config.build.entry
  : config.dev.entry

// 建议统一使用resolve，更直观
const modules = [
  path.join(__dirname, '../'), // mpvue-simple的项目根路径，用于解析babel/postcss等配置文件时的寻址
  path.join(__dirname, '../node_modules'), // mpvue-simple项目的依赖存放路径，用于获取mpvue-simple的依赖
  path.join(__dirname, '../../node_modules'), // 当mpvue-simple被其他构建工程依赖时，部分依赖会被铺平到mpvue-simple同级
  resolve('./'), // 项目当前路径
  resolve('./node_modules') // 项目的依赖
]
// mp compiler 全局模式下注入 babelrc
vueLoaderConfig.globalBabelrc = path.resolve(__dirname, '../.babelrc')

module.exports = {
  entry,
  target: require('mpvue-webpack-target'),
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue': 'mpvue',
      '@': resolve('src')
    },
    symlinks: false,
    modules
  },
  resolveLoader: {
    modules
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'mpvue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!mpvue-simple\/src\/)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              extends: vueLoaderConfig.globalBabelrc
            }
          },
          {
            loader: 'mpvue-loader',
            options: {
              checkMPEntry: true
            }
          },
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name]].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[ext]')
        }
      }
    ]
  }
}
