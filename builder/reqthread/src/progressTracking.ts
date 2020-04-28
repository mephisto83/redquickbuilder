export interface ProgressTracking {
	[agentProject: string]: AgentProgress;
}

export interface AgentProgress {
	[project: string]: ProjectProgress;
}

export interface ProjectProgress {
	[partProgress: string]: PartProgress;
}

export interface PartProgress {
	completed: boolean;
	complete: number;
	total: number;
}
