var fs = require('fs');
var os = require('os');
console.log('execute red quick distro worker')
var Distribution = require('./dist/reqthread/src/distribution').default;
let distribution = new Distribution();
(async function () {
  console.log(distribution);
  let fle = fs.readFileSync('./applicationConfig.json', 'utf8');
  let adata = JSON.parse(fle);
  let dir = os.platform() === 'linux' ? '/home/andrew/work_folder' :(adata["D:\\temp\\job_service_jobs"]||'D:/temp/workout_wd');

  await distribution.start({
    entryPath: './dist/reqthread/src/thread.js',
    folder: dir,
    baseFolder: dir,
    workingDirectory:dir,
    throttle: 120 * 1000,
    threads: adata.threads || 1,
    remoteServerHost: '192.168.1.146',
    remoteServerPort: 7973
  })

  await distribution.run(false);
})();
