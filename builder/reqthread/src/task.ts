/*
The place where 3rd party long running task should start.
*/
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getDirectories } from './threadutil';
import executeJob from './executeJob';
import JobService, { Job, JobServiceConstants } from '../../app/jobs/jobservice';

export default async function task(jobPath: string) {
	if (ifJobExists(jobPath)) {
		console.log('there are jobs');
		let jobConfig: Job = getUnfinishedJob(jobPath);
		if (jobConfig) {
			if (await canJobExecute(jobConfig)) {
				console.log('execute job');
				jobConfig = await executeJob(jobConfig);
				console.log('job complete');
				await updateJobConfig(jobConfig);
			}
		} else {
			console.log('all jobs are complete');
		}
	}
	return new Promise((resolve) => setTimeout(resolve, 120 * 1000));
}
async function canJobExecute(jobConfig: Job): Promise<boolean> {
	const { jobInstancePath } = jobConfig;
	return await JobService.CanJoinFiles(jobInstancePath, JobServiceConstants.GRAPH_FILE);
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
function updateJobConfig(jobConfig: Job) {
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
