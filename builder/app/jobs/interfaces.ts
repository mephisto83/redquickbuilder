import { RedQuickDistributionCommand } from './communicationTower';

export interface RunnerContext {
	agents: Agents;
	commandCenter: CommandCenter;
	commandCenters: CommandCenter[];
	jobCompletionList: Promise<void>;
}

export interface CommandCenter {
	commandCenterPort: any;
	id: string;
	failedCalls?: number;
	commandCenterHost: any;
}
export interface Agents {
	[agent: string]: Agent;
}

export interface Agent {
	name: string;
	lastUpdated: number;
	host: string;
	port: number;
	projects: AgentProjects;
}

export interface AgentProjects {
	[project: string]: AgentProject;
}

export interface AgentProject {
	busy?: boolean;
	updated?: number;
	error?: any;
	errorMessage?: any;
	progress?: number;
	workingOnFile?: string;
	workingOnJob?: string;
	agent?: string;
	agentName?: string;
	agentProject?: string;
	relativePath?: string | null;
	command?: RedQuickDistributionCommand;
	ready?: boolean;
	hostname?: string | null;
	targetHost?: string;
	targetPort?: number;
	name?: string;
	host?: string;
	port?: number;
}
