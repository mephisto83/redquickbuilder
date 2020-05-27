import { Graph } from './graph_types';
import fs from 'fs';
import JobService, { ensureDirectory, path_join } from '../jobs/jobservice';
import os from 'os';
import path, { relative } from 'path';
import readline from 'readline';
import stream from 'stream';
import prune from './prune';
import { GUID } from '../actions/uiactions';
const NEW_LINE_REPLACEMENT = '$Åøcå';
const SECTION_HEADER = '$@HEADER#!@_';
export const LINK_LIB = 'linkLib';
export const NODE_LIB = 'nodeLib';
export const GROUP_LIB = 'groupLib';
export const GRAPH_LIB = 'graphLib';
export default async function StoreGraph(graph: Graph, filePath: string) {
	console.log('writing graph to : ' + filePath);
	await writeGraph(filePath, graph);
}

export async function LoadGraph(filePath: string): Promise<Graph | any> {
	return await readLine(path.dirname(filePath), [ path.basename(filePath) ]);
}
async function writeGraph(fileName: string, unprunedGraph: Graph) {
	let graph = prune({ ...unprunedGraph });
	await ensureDirectory(path.dirname(fileName));
	console.log('write graph ' + fileName);

	let outstream = fs.createWriteStream(fileName);
	outstream.write(`${SECTION_HEADER}${LINK_LIB}\n`);
	for (var i in graph.linkLib) {
		await writeToStream(i, graph.linkLib[i], outstream);
	}
	outstream.write(`${SECTION_HEADER}${GROUP_LIB}\n`);
	for (var i in graph.groupLib) {
		await writeToStream(i, graph.groupLib[i], outstream);
	}
	outstream.write(`${SECTION_HEADER}${NODE_LIB}\n`);
	for (var i in graph.nodeLib) {
		await writeToStream(i, graph.nodeLib[i], outstream);
	}

	let newgraph: Graph = { ...graph };
	newgraph.linkLib = {};
	newgraph.nodeLib = {};
	newgraph.groupLib = {};

	outstream.write(`${SECTION_HEADER}${GRAPH_LIB}\n`);

	await writeGraphToStream(newgraph, outstream);

	outstream.close();
	console.log('wrote graph');
}

async function writeToStream(i: string, obj: any, outstream: fs.WriteStream): Promise<void> {
	let temp = JSON.stringify({ k: i, v: obj });
	if (temp.indexOf(NEW_LINE_REPLACEMENT) !== -1) {
		throw new Error('can save graph, cause the delimiter exists in the file');
	}
	temp = temp.replace(/(\r\n|\n|\r)/gm, NEW_LINE_REPLACEMENT);
	await new Promise((resolve, fail) => {
		outstream.write(temp + '\n', 'utf8', (err: any) => {
			if (err) {
				console.error(err);
				fail(err);
			} else {
				resolve();
			}
		});
	});
}

function writeGraphToStream(obj: any, outstream: fs.WriteStream) {
	let temp = JSON.stringify(obj);
	if (temp.indexOf(NEW_LINE_REPLACEMENT) !== -1) {
		throw new Error('can save graph, cause the delimiter exists in the file');
	}
	temp = temp.replace(/(\r\n|\n|\r)/gm, NEW_LINE_REPLACEMENT);
	outstream.write(temp + '\n', 'utf8', (err: any) => {
		if (err) {
			console.error(err);
			throw err;
		}
	});
}
export async function LoadBrokenGraph(relPath: string, fileNames: string[]) {
	console.log('load broken graph');
	console.log(relPath);
	console.log(fileNames);
	return await readLine(relPath, fileNames);
}

export async function StreamGraph(
	relPath: string,
	fileNames: string[],
	callback: (key: any, obj: any, type: string) => void
) {
	console.log('stream broken graph');
	console.log(relPath);
	console.log(fileNames);
	await streamLine(relPath, fileNames, callback);
}

async function streamLine(
	relPath: string,
	fileNames: string[],
	callback: (key: any, obj: any, type: string) => void
): Promise<void> {
	let currentSection: string | null = null;

	let bucket = '';
	let attempts = 10;
	let successful = true;
	do {
		successful = true;
		try {
			await fileNames
				.map((fname) => path_join(relPath, fname))
				.forEachAsync(async (filename: string, index: number) => {
					return await new Promise((resolve, fail) => {
						console.log(`Reading : ${filename}`);
						var instream = fs.createReadStream(filename);
						var rl = readline.createInterface(instream);
						rl.on('line', function(line: string) {
							// process line here
							if (line.startsWith(SECTION_HEADER)) {
								currentSection = line.substring(SECTION_HEADER.length);
							} else if (!currentSection) {
								bucket = bucket + line;
							} else {
								line = line.replace(NEW_LINE_REPLACEMENT, '\n');
								let obj;
								try {
									if (line.trim()) {
										obj = JSON.parse(line);
									}
								} catch (e) {
									console.log(currentSection);
									console.log(line);
									console.log(e);
									throw e;
								}
								switch (currentSection) {
									case LINK_LIB:
									case GROUP_LIB:
									case NODE_LIB:
										callback(obj.k, obj.v, currentSection);
										break;
									case GRAPH_LIB:
										callback(null, obj, currentSection);
										break;
								}
							}
						});

						rl.on('close', function() {
							// do something on finish here
							resolve();
							instream.close();
						});
					});
				});
		} catch (e) {
			console.log('something went wrong trying to read a file');
			console.log(e);
			successful = false;
			attempts--;
			if (!attempts) {
				throw 'something really went wrong with this crap';
			}
		}
	} while (!successful);
	if (bucket) {
		throw new Error('not supported type');
	}
}

async function readLine(relPath: string, fileNames: string[]) {
	let currentSection: string | null = null;
	let linkLib: { [key: string]: any } = {};
	let groupLib: { [key: string]: any } = {};
	let nodeLib: { [key: string]: any } = {};
	let graph: Graph | null = null;

	let bucket = '';
	let attempts = 10;
	let successful = true;
	do {
		successful = true;
		try {
			await fileNames
				.map((fname) => path_join(relPath, fname))
				.forEachAsync(async (filename: string, index: number) => {
					return await new Promise((resolve, fail) => {
						console.log(`Reading : ${filename}`);
						var instream = fs.createReadStream(filename);
						var rl = readline.createInterface(instream);
						rl.on('line', function(line: string) {
							// process line here
							if (line.startsWith(SECTION_HEADER)) {
								currentSection = line.substring(SECTION_HEADER.length);
							} else if (!currentSection) {
								bucket = bucket + line;
							} else {
								line = line.replace(NEW_LINE_REPLACEMENT, '\n');
								let obj;
								try {
									if (line.trim()) {
										obj = JSON.parse(line);
									}
								} catch (e) {
									console.log(currentSection);
									console.log(line);
									console.log(e);
									throw e;
								}
								switch (currentSection) {
									case LINK_LIB:
										linkLib[obj.k] = obj.v;
										break;
									case GROUP_LIB:
										groupLib[obj.k] = obj.v;
										break;
									case NODE_LIB:
										nodeLib[obj.k] = obj.v;
										break;
									case GRAPH_LIB:
										graph = obj;
										break;
								}
							}
						});

						rl.on('close', function() {
							// do something on finish here
							if (graph) {
								graph.linkLib = linkLib;
								graph.nodeLib = nodeLib;
								graph.groupLib = groupLib;
							} else {
							}
							resolve();
							instream.close();
						});
					});
				});
		} catch (e) {
			console.log('something went wrong trying to read a file');
			console.log(e);
			successful = false;
			attempts--;
			if (!attempts) {
				throw 'something really went wrong with this crap';
			}
		}
	} while (!successful);
	if (bucket) {
		graph = JSON.parse(bucket);
		return graph;
	}
	return graph;
}

export async function SplitIntoFiles(relPath: string, chunkFolder: string, chunkName: string, currentGraph: Graph) {
	console.log('split into files');
	let fileNames: string[] = [];
	let tempName = `temp_${GUID()}.json`;
	await ensureDirectory(path.join(relPath, chunkFolder));

	let temporaryFile = path.join(relPath, chunkFolder, tempName);
	console.log('store graph in temporary file');
	await StoreGraph(currentGraph, temporaryFile);
	const linesPerFile = Math.pow(2, 16);
	let currentCount = 0;
	let currentFile = 0;
	let fileContent = '';
	await new Promise((resolve, fail) => {
		var instream = fs.createReadStream(temporaryFile);
		var rl = readline.createInterface(instream);
		console.log('read lines into various files');
		rl.on('line', function(line: string) {
			// process line here
			fileContent = fileContent + line + '\n';
			if (currentCount >= linesPerFile) {
				currentCount = 0;
				fs.writeFileSync(path.join(relPath, chunkFolder, chunkName + currentFile), fileContent);
				fileNames.push(path.join(chunkFolder, chunkName + currentFile));
				currentFile++;
				fileContent = '';
			} else {
				currentCount++;
			}
		});

		rl.on('close', function() {
			// do something on finish here
			if (fileContent) {
				fs.writeFileSync(path.join(relPath, chunkFolder, chunkName + currentFile), fileContent);
				fileNames.push(path.join(chunkFolder, chunkName + currentFile));
			}
			resolve();
		});
	});

	console.log('delete temporary file');
	fs.unlinkSync(temporaryFile);

	return fileNames;
}
