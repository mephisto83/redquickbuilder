export interface DistrConfig {
	baseFolder: string;
	workingDirectory: string;
	agentName: string;
	agentProject: string;
	folder: string;
	throttle: number;
	entryPath: string;
	threads?: number;
	remoteServerHost: string;
	remoteServerPort: number;
	checkWait: number;
}
