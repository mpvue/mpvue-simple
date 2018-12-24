// https://github.com/michael-ciniawsky/postcss-load-config

const autoprefixer = require('autoprefixer')
const postcssMpvueWxss = require('postcss-mpvue-wxss')

/**
 * 优先使用simple的依赖
 * 解决字符串写法只在业务项目中寻找依赖的问题
 */
module.exports = {
  plugins:[
    autoprefixer({}),
    postcssMpvueWxss({})
  ]
}
