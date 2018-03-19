const path = require('path')
const childProcess = require('child_process')
const { execSync } = childProcess
const http = require('http');
const https = require('https');
// upgrade logger
function upgradeLogger () {
  const currPkg = require('../package.json')
  const cwd = path.resolve(__dirname, '../')
  const pkgName = currPkg.name || 'mpvue-simple'
  const url = execSync('npm config get registry', {encoding: 'utf-8'}).replace('\n', '');
  const request = url.startsWith('https') ? https.get : http.get;
  try {
    request(`${url}${pkgName}`, (res) => {
      let rawData = '';
      res.on('data', (chunk) => rawData += chunk);
      res.on('end', () => {
        const parsedData = JSON.parse(rawData);
        let latestVesion = parsedData['dist-tags'].latest
        if (latestVesion !== currPkg.version) {
          console.log(`${pkgName} 有新版本 ${latestVesion} 啦，请注意升级。\n例如: npm install ${pkgName} -g\n`)
        }
      })
    }).on('error', (e) => {
      console.error(`Got error: ${e.message}`);
    });
  } catch (e) {
    console.log(e.message);
  }
}

exports.upgradeLogger = upgradeLogger
