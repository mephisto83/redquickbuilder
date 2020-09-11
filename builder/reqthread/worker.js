var fs = require('fs');
var path = require('path');
var os = require('os');
console.log('execute red quick distro worker')
var Distribution = require('./dist/reqthread/src/distribution').default;
let distribution = new Distribution();
(async function () {
  console.log(distribution);
  let filePath = getAppConfigPath();
  let fle = fs.readFileSync(path.join(filePath, 'reqthread', './applicationConfig.json'), 'utf8');
  let adata = JSON.parse(fle);

  console.log(`----------- appConfigPath ----------`)
  console.log(filePath);
  console.log(`----------- appConfig ----------`)
  console.log(adata);

  let dir = os.platform() === 'linux' ? '/home/andrew/work_folder' : (adata["D:\\temp\\job_service_jobs"] || 'D:/temp/workout_wd');
  let address = getIpaddress();
  console.log(`-------- dir ${dir} --------------`)
  await distribution.start({
    entryPath: './dist/reqthread/src/thread.js',
    folder: dir,
    baseFolder: dir,
    workingDirectory: dir,
    throttle: 120 * 1000,
    threads: adata.threads || 1,
    remoteServerHost: adata.remote || address.hostname || '192.168.1.138',
    remoteServerPort: 7972
  })

  await distribution.run(false);
})();

function getAppConfigPath($folder) {
  const homedir = require('os').homedir();
  const folder = $folder ? path.join(homedir, '.rqb', $folder) : path.join(homedir, '.rqb');
  ensureDirectorySync(folder);
  return folder;
}

function ensureDirectorySync(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`doesnt exist : ${dir}`);
  } else {
  }
  const _dir_parts = dir.split(path.sep);
  _dir_parts.map((_, i) => {
    if (i > 1 || _dir_parts.length - 1 === i) {
      let tempDir = path.join(..._dir_parts.subset(0, i + 1));
      if (dir.startsWith(path.sep)) {
        tempDir = `${path.sep}${tempDir}`;
      }
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
    }
  });
}


function getIpaddress() {
  var ifaces = os.networkInterfaces();
  let addressLib = { hostname: null };
  Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;
    ifaces[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }

      addressLib[ifname] = iface.address;
      addressLib.hostname = iface.address;
      ++alias;
    });
  });
  return addressLib;
}
