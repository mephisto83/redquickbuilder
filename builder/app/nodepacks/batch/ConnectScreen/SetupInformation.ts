import { Node } from "../../../methods/graph_types";

export interface SetupInformation {
	agent: string;
	model: string;
	viewType: string;
	agentAccessDescription: Node;
}
