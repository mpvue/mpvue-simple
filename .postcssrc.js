// https://github.com/michael-ciniawsky/postcss-load-config

const autoprefixer = require('autoprefixer')
const postcssMpvueWxss = require('postcss-mpvue-wxss')
/**
 * 优先使用simple的依赖，尽量做到构建工具与业务代码隔离
 * 字符串约定的写法，在postcss某个版本开始后，寻址路径发生变更，只会去被编译项目的依赖中去找了，与simple的预期不符
 */
module.exports = {
  plugins:[
    autoprefixer({}),
    postcssMpvueWxss({})
  ]
}
