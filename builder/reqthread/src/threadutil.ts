import fs from 'fs';
import path from 'path';

export interface AgentDirectories {
	[id: string]: AgentDirectory;
}
export interface AgentDirectory {
	[id: string]: {};
}
export function getAgentTrees(folder: string): AgentDirectories {
	if (fs.existsSync(folder)) {
		let agentDirectories = getDirectories(folder);
		let result: AgentDirectories = {};
		agentDirectories.forEach((agent) => {
			result[agent] = {};
			let projects = getDirectories(path.join(folder, agent));
			projects.map((project) => {
				result[agent][project] = JSON.parse(
					fs.readFileSync(path.join(folder, agent, project, 'config.json'), 'utf8')
				);
			});
		});
		return result;
	}

	throw new Error('folder doesnt exist');
}

const isDirectory = (source) => fs.lstatSync(source).isDirectory();
const getDirectories = (source) => fs.readdirSync(source).filter((name) => isDirectory(path.join(source, name)));
