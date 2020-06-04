/*
The place where 3rd party long running task should start.
*/
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getDirectories } from './threadutil';
import executeJob from './executeJob';
import JobService, { Job, JobServiceConstants } from '../../app/jobs/jobservice';

export default async function task(
	jobPath: string,
	options: { folderPath: string; agentName: string; projectName: string; fileName: string },
	onChange: Function,
	onProgress: Function
) {
	if (ifJobExists(jobPath)) {
		console.log('there are jobs');
		console.log(jobPath);
		console.log(options);
		let jobConfig: Job = await JobService.loadRemoteJob(jobPath);
		if (jobConfig) {
			console.log('execute job');
			jobConfig = await executeJob(jobConfig, options, onChange, onProgress);
			console.log('job complete');
		} else {
			throw new Error('job not found');
		}
	}
}

function getUnfinishedJob(jobPath: string): Job {
	let folderExists = fs.existsSync(jobPath);
	if (folderExists) {
		let jobList = getDirectories(jobPath);
		let res = jobList
			.map((jobFolder) => {
				const jobConfig = getJobConfig(path.join(jobPath, jobFolder));
				if (jobConfig) {
					if (!isJobComplete(jobConfig)) {
						return jobConfig;
					}
				}
				return null;
			})
			.filter((x) => x);
		if (res && res.length) {
			return res[0];
		}
	}
	return null;
}
function checkForIncompleteJobs(jobPath: string) {
	return getUnfinishedJob(jobPath);
}
function isJobComplete(jobConfig: Job) {
	return jobConfig.complete;
}
function getJobConfig(jobInstancePath: string): Job {
	const configFile: string = path.join(jobInstancePath, JobServiceConstants.JOB_NAME);
	if (fs.existsSync(jobInstancePath)) {
		if (fs.existsSync(configFile)) {
			const jobConfiguration: Job = JSON.parse(fs.readFileSync(configFile, 'utf8'));
			jobConfiguration.absolutePath = configFile;
			jobConfiguration.configAbsolutePath = configFile;
			jobConfiguration.jobInstancePath = jobInstancePath;
			console.log('job found');
			return jobConfiguration;
		}
	} else {
		console.log('job instance path didnt exist');
	}
	return null;
}
async function updateJobConfig(jobConfig: Job) {
	try {
		jobConfig.updated = Date.now();
		let content = JSON.stringify(jobConfig, null, 4);
		fs.writeFileSync(jobConfig.configAbsolutePath, content, 'utf8');
	} catch (e) {
		console.error(e);
		throw e;
	}
}
function ifJobExists(jobPath: string) {
	let folderExists = fs.existsSync(jobPath);
	if (folderExists) {
		let jobList = getDirectories(jobPath);
		return jobList.length;
	}
	return false;
}
