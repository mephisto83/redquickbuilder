import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';

const NAME_SPACE_TEMPLATE = './app/templates/namespace.tpl';

export default class NamespaceGenerator {
    static Generate(options) {
        var { template, namespace, space, usings } = options;
        let namespaceTemplate = fs.readFileSync(NAME_SPACE_TEMPLATE, 'utf-8');

        namespaceTemplate = bindTemplate(namespaceTemplate, {
            namespace,
            space,
            imports: usings ? usings.map(x=> `using ${x};`).unique(x => x).join('\r\n') : null,
            body: template
        })

        return namespaceTemplate;
    }
}