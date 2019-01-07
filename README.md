# mpvue-simple

> 辅助 mpvue 快速开发 Page / Component 级小程序页面的工具，所以也需要有一定的小程序开发经验。
>
> mpvue QuickStart 只支持项目级应用开发，对 Page / Component 级小程序页面开发场景缺少支持，而 simple 刚好来填补这部分需求，用以支持 mpvue 和原生小程序（或者其他方式小程序）的混用。

详细文件见：[mpvue-simple](http://mpvue.com/mpvue/simple)

bug 或者交流建议等请反馈到 [mpvue/issues](https://github.com/Meituan-Dianping/mpvue/issues)。

## example
```
const mpvueSimple = require('mpvue-simple')

// build for signel Page
mpvueSimple.build()

// or more options
mpvueSimple.build({
  output: 'mp-pages',
  pageName: 'login'
})

// or more options
mpvueSimple.build({
  output: {
    path: 'mp-pages',
    jsonpFunction: 'webpackJsonpMpvue' // optional config
  },
  pageName: 'login'
})

// maybe you want to do something after building
mpvueSimple.build()  // => Promise
.then(() => console.log('mpvue build success'))
.catch(err => throw new Error(err))
```

## changelog
#### `1.0.18`

- 加入可选配置项 `externals`，通过在webpack中增加external属性的方式，可以在打包的时候移除公共模块的引入，从而减小包大小。

  在构建脚本中进行如下定义：

    ```javascript
  mpvueSimple.build({
      externals: {
          sdk: 'require("../../../../sdk")', // 公共模块的相对路径
      },
  })
    ```

  在页面文件中进行如下引用：

    ```javascript
  import SDK from 'sdk'; // 注意这里的sdk，应为externals的key
    ```




#### `1.0.17`

- 加入可选配置项 `output.jsonpFunction`，mpvue 打包构建后会在 `manifest.js` 中生生成全局的模块加载器函数 `global.webpackJsonp`，为防止和其它构建工具引起命名冲突，该默认函数名可在 output 配置中指定，示例如上。

