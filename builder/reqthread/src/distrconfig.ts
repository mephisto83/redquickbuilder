export interface DistrConfig {
	baseFolder: string;
	serverPort: number;
	workingDirectory: string;
	folder: string;
	throttle: number;
	entryPath: string;
	threads?: number;
	remoteServerHost: string;
	remoteServerPort: number;
	checkWait: number;
}
