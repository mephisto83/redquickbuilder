import { JobServiceConstants, ensureDirectory, JobFile } from '../../jobs/jobservice';
import { GetCurrentGraph } from '../../actions/uiactions';
import { Graph } from '../../methods/graph_types';
import fs from 'fs';
import path from 'path';
import NameService from '../../jobs/nameservice';
export default async function StartJob() {
	await ensureDirectory(JobServiceConstants.JobsFilePath());
	let currentGraoh: Graph = GetCurrentGraph();
	if (currentGraoh.graphFile) {
		let job: JobFile = {
			created: false,
			graphPath: currentGraoh.graphFile ? currentGraoh.graphFile : ''
		};
		let jobName = NameService.projectGenerator();
		fs.writeFileSync(path.join(JobServiceConstants.JobsFilePath(), jobName), JSON.stringify(job), 'utf8');
	} else {
		throw new Error('graph has not been saved');
	}
}

StartJob.title = 'Start Job';
