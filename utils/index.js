const path = require('path')
const childProcess = require('child_process')
const { execSync } = childProcess

// upgrade logger
function upgradeLogger () {
  const currPkg = require('../package.json')
  const cwd = path.resolve(__dirname, '../')
  const pkgName = currPkg.name || 'mpvue-simple'
  const pkg = JSON.parse(execSync(`curl \`npm config get registry\`${pkgName} -s`, { cwd }))
  const latestVesion = pkg['dist-tags'].latest

  if (latestVesion !== currPkg.version) {
    console.log(`${pkgName} 有新版本 ${latestVesion} 啦，请注意升级。\n例如: npm install ${pkgName} -g\n`)
  }
}

exports.upgradeLogger = upgradeLogger
