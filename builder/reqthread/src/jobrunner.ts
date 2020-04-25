import fs from 'fs';
import path from 'path';
import { sleep, setupJob, saveCurrentGraphTo } from './threadutil';
import JobService, { JobServiceConstants, getFiles, JobFile, getDirectories } from '../../app/jobs/jobservice';
import BuildAllDistributed, { BuildAllInfo } from '../../app/nodepacks/batch/BuildAllDistributed';

(async function runner() {
	while (true) {
		await createJobs();
		await processJobs();
		await sleep();
	}
})();

async function processJobs() {
	if (fs.existsSync(JobServiceConstants.JOBS_FILE_PATH)) {
		let projectFolders = getDirectories(JobServiceConstants.JOBS_FILE_PATH);
		await projectFolders.forEachAsync(async (projectFolder) => {
			let jobFilePath = path.join(
				JobServiceConstants.JOBS_FILE_PATH,
				projectFolder,
				JobServiceConstants.JOB_NAME
			);
			if (fs.existsSync(jobFilePath)) {
				await executeStep(jobFilePath);
			}
		});
	}
}

async function executeStep(jobFilePath: string) {
  console.log('read job file path');
  console.log(jobFilePath);
  let jobConfigContents = fs.readFileSync(jobFilePath, 'utf8');
	let jobConfig: JobFile = JSON.parse(jobConfigContents);
	if (!jobConfig.error) {
		try {
      console.log('get next command');
      let currentStep = BuildAllInfo.Commands.findIndex((v) => v.name === jobConfig.step);
      console.log('setup job');
      console.log(jobConfig.graphPath);
      await setupJob(path.dirname(jobConfig.graphPath));
      let step = BuildAllInfo.Commands[currentStep + 1];
      console.log('build all distributed');
			await BuildAllDistributed(step.name, jobConfig);
      console.log('save current graph to');
			await saveCurrentGraphTo(jobConfig.graphPath);
      jobConfig.step = step.name;
      console.log(jobConfig.step);
		} catch (e) {
      console.log(e);
      console.log(jobConfig);
			jobConfig.error = `${e}`;
		} finally {
			await JobService.saveJobFile(jobFilePath, jobConfig);
		}
  }
  else {
    console.log('job has an error, skipping');
  }
}
async function createJobs() {
	if (fs.existsSync(JobServiceConstants.JOBS_FILE_PATH)) {
		let jobFiles = getFiles(JobServiceConstants.JOBS_FILE_PATH);
		await jobFiles.forEachAsync(async (jobFileName) => {
			try {
        let jobFilePath = path.join(JobServiceConstants.JOBS_FILE_PATH, jobFileName);
				let fileContents = fs.readFileSync(jobFilePath, 'utf8');
				let jobFile: JobFile = JSON.parse(fileContents);
				if (jobFile && jobFile.graphPath && !jobFile.created) {
					if (fs.existsSync(jobFile.graphPath)) {
						let graphFileContents = fs.readFileSync(jobFile.graphPath, 'utf8');
						try {
							jobFile.created = true;
              await JobService.WriteJob(jobFile, graphFileContents);
              await JobService.saveJobFile(jobFilePath, jobFile);
						} catch (e) {
							console.error('createJobs: failed while writing job');
							console.error(e);
						}
					} else {
						console.log('createJobs: file doesnt exist');
					}
				} else {
					console.log('no file path');
				}
			} catch (e) {
				console.error(e);
			}
		});
	} else {
		console.log('no jobs folder');
	}
}
