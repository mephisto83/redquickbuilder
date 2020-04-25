import { JobServiceConstants, ensureDirectory, JobFile } from '../../jobs/jobservice';
import { GetCurrentGraph } from '../../actions/uiactions';
import { Graph } from '../../methods/graph_types';
import fs from 'fs';
import NameService from '../../jobs/nameservice';
export default async function StartJob() {
	await ensureDirectory(JobServiceConstants.JOBS_FILE_PATH);
	let currentGraoh: Graph = GetCurrentGraph();
	if (currentGraoh.graphFile) {
		let job: JobFile = {
			created: false,
			graphPath: currentGraoh.graphFile ? currentGraoh.graphFile : ''
		};
		let jobName = NameService.projectGenerator();
		fs.writeFileSync(path.join(JobServiceConstants.JOBS_FILE_PATH, jobName), JSON.stringify(job), 'utf8');
	} else {
		throw new Error('graph has not been saved');
	}
}
