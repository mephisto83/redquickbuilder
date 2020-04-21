process.on('message', (m) => {
	if (m) {
		var { id, message } = m;
		try {
			handleRemoteMessages(message, (res: any) => {
				if (process && process.send) {
					process.send({ id, response: res });
				}
			});
		} catch (e) {
			console.error(e);
		}
	}
});

function handleRemoteMessages(res: string, callback: Function) {
	try {
		let msg;
		if (typeof res === 'string') {
			let t_ = JSON.parse(res);
			msg = t_.msg;
			let { message } = msg;
			let reply = (returnMsg: any) => {
				if (callback) {
					callback(returnMsg);
				}
			};
			switch (message) {
				default:
					console.log('did nothing');
					reply(null);
					break;
			}
		}
	} catch (e) {
		console.error(e);
		console.log('something went wrong');
	}
}
