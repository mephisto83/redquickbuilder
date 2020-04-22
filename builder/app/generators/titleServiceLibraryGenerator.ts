import { GetCurrentGraph, GetNodeTitle, NodeProperties, GetNodeProp } from '../actions/uiactions';
import { UITypes, Languages } from '../constants/nodetypes';

export default class TitleServiceLibraryGenerator {
	static Generate(options: any) {
		const { language } = options;
		const graph: any = GetCurrentGraph();

		let fileEnding;
		switch (language) {
			case UITypes.ElectronIO:
			case UITypes.ReactWeb:
				fileEnding = '.ts';
				break;
			default:
				fileEnding = '.js';
				break;
		}

		const { languageTitles = { titles: {} } } = graph;

		const titleJson: any = {};

		if (languageTitles && languageTitles.titles) {
			Object.keys(languageTitles.titles).map((v) => {
				const temp = languageTitles.titles[v];
				const { title = GetNodeProp(temp.id, NodeProperties.Label), id = temp.id, properties = {} } = temp;
				if (title && title.trim()) {
					titleJson[title.trim()] = {
						id,
						properties
					};
				}
			});
		}
		const template = `export default ${JSON.stringify(
			{ lib: titleJson, preferred: Languages['US-English'] },
			null,
			4
		)}`;
		return {
			'./actions/titleServiceLib.js': {
				template,
				relative: './app/actions',
				relativeFilePath: `./titleServiceLib${fileEnding}`,
				name: './actions/titleServiceLib.js'
			}
		};
	}
}
