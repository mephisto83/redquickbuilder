import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodesByType, GetState, NodeTypes } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, NameSpace } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import { fs_readFileSync } from './modelgenerators';

const NAME_SPACE_TEMPLATE = './app/templates/namespace.tpl';

export default class NamespaceGenerator {
	static Generate(options: any) {
		var { template, namespace, space, usings } = options;
		let namespaceTemplate = fs_readFileSync(NAME_SPACE_TEMPLATE, 'utf8');
		let ext_nodes = NodesByType(GetState(), [ NodeTypes.ExtensionType, NodeTypes.ExtensionTypeList ]);
		if (!ext_nodes.length) {
			usings = (usings || []).filter((x: any) => x.indexOf(`${namespace}${NameSpace.Extensions}`) === -1);
		}
		namespaceTemplate = bindTemplate(namespaceTemplate, {
			namespace,
			space,
			imports: usings ? usings.map((x: any) => `using ${x};`).unique((x: any) => x).join('\r\n') : null,
			body: template
		});

		return namespaceTemplate;
	}
}
