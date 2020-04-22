/*
The place where 3rd party long running task should start.
*/

export default function task(jobPath: string) {
	return new Promise((resolve) => setTimeout(resolve, 120 * 1000));
}
