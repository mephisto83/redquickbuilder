/*
The place where 3rd party long running task should start.
*/
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getDirectories } from './threadutil';
import executeJob from './executeJob';
import { Job } from '../../app/jobs/jobservice';

export default async function task(jobPath: string) {
	if (ifJobExists(jobPath)) {
		console.log('there are jobs');
		if (checkForIncompleteJobs(jobPath)) {
			let jobConfig: Job = getUnfinishedJob(jobPath);
			jobConfig = await executeJob(jobConfig);
			await updateJobConfig(jobConfig);
		}
	}
	return new Promise((resolve) => setTimeout(resolve, 120 * 1000));
}
function getUnfinishedJob(jobPath: string) {
	let folderExists = fs.existsSync(jobPath);
	if (folderExists) {
		let jobList = getDirectories(jobPath);
		jobList.filter((jobFolder) => {
			const jobConfig = getJobConfig(path.join(jobPath, jobFolder));
			if (jobConfig) {
				if (!isJobComplete(jobConfig)) {
					return jobConfig;
				}
			}
			return null;
		});
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
	const configFile: string = path.join(jobInstancePath, 'config.json');
	if (fs.existsSync(jobInstancePath)) {
		if (fs.existsSync(configFile)) {
			const jobConfiguration: Job = JSON.parse(fs.readFileSync(configFile, 'utf8'));
			jobConfiguration.absolutePath = configFile;
			jobConfiguration.configAbsolutePath = jobInstancePath;
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
		let content = JSON.stringify(jobConfig.configAbsolutePath, null, 4);
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
