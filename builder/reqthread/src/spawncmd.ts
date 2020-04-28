var child_process = require('child_process'),
	exec = child_process.exec,
	spawn = child_process.spawn;

export default class SpawnCmd {
	static async executeSpawnCmd(cmd: string, args: any[], options: any = null) {
		console.log('execute spawn cmd');
		return new Promise(function(resolve, fail) {
			console.log(cmd);
			console.log(args);
			options = { ...options || {}, shell: true };
			var child;
			if (process.platform === 'win32') {
				child = spawn(cmd, args, options);
			} else {
				child = spawn('sudo', [ cmd, ...args ], options);
			}
			options._kill = function() {
				child.kill();
			};
			child.stdout.on('data', function(data) {
				console.log('stdout: ' + data);
			});

			child.stderr.on('data', function(data) {
				console.log('data: ' + data);
			});
			child.on('error', function(err) {
				console.log(err);
				child.stdin.pause();
				child.kill();
				fail();
			});
			child.on('exit', function(code) {
				console.log('child process exited with code ' + code);
				child.stdin.pause();
				child.kill();
				if (code != 0) {
					console.log('Failed: ' + code);
					fail(code);
					return;
				}
				resolve();
			});
		});
	}
}
