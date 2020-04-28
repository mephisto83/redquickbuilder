console.log('execute red quick distro worker')
var Distribution = require('./dist/reqthread/src/distribution').default;
let distribution = new Distribution();
(async function () {
  console.log(distribution);

  await distribution.start({
    entryPath: './dist/reqthread/src/thread.js',
    folder: 'D:/temp/workout_wd',
    baseFolder: 'D:/temp/workout_wd',
    workingDirectory: 'D:/temp/workout_wd',
    throttle: 120 * 1000,
    threads: 3,
    serverPort: 8000,
    remoteServerHost: '192.168.1.146',
    remoteServerPort: 7979
  })

  await distribution.run(false);
})();
