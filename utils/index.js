const path = require('path')
const http = require('http');
// upgrade logger
function upgradeLogger () {
  const currPkg = require('../package.json')
  const cwd = path.resolve(__dirname, '../')
  const pkgName = currPkg.name || 'mpvue-simple'

  http.get('http://registry.npmjs.org/' + currPkg.name, (res) => {
    let rawData = '';
    res.on('data', (chunk) => rawData += chunk);
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        let latestVesion = parsedData['dist-tags'].latest;
        if (latestVesion !== currPkg.version) {
          console.log(`${pkgName} 有新版本 ${latestVesion} 啦，请注意升级。\n例如: npm install ${pkgName} -g\n`)
        }
      } catch (e) {
        console.log(e.message);
      }
    });
  })
}

exports.upgradeLogger = upgradeLogger
