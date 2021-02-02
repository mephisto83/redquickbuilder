import { GetCodeName, GetNodeProp, GetRootGraph, NodesByType } from "../actions/uiActions";
import { bindTemplate } from "../constants/functiontypes";
import { NameSpace, NEW_LINE, NodeProperties, NodeTypes, STANDARD_CONTROLLER_USING } from "../constants/nodetypes";
import { GraphKeys } from "../methods/graph_methods";
import { Node } from "../methods/graph_types";
import NamespaceGenerator from "./namespacegenerator";

export default class StreamTypeServiceGenerator {

    static Generate(options: { state: any; key: any; language?: any }) {

        const result: any = {};
        const { state } = options;
        const graphRoot = GetRootGraph(state);
        const namespace = graphRoot ? graphRoot[GraphKeys.NAMESPACE] : null;
        

        const models = NodesByType(state, NodeTypes.Model)
            .filter((x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromGeneration))
            .filter((x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromController));
        let stream_types = models.map((model: Node) => {
            return `public const string ${GetCodeName(model)} = "${GetCodeName(model)}";` + NEW_LINE;
        }).join('');
        let stream_types_list = models.map((model: Node) => {
            return `StreamType.${GetCodeName(model).toUpperCase()}`;
        }).join(',' + NEW_LINE);
        let template = bindTemplate(StreamTypeTemplate, {
            namespace,
            stream_types,
            stream_types_list
        });
        result['Stream_Type_Service_Generator'] = {
            id: 'Stream_Type_Service_Generator',
            name: 'StreamTypeService',
            template: NamespaceGenerator.Generate({
                template,
                usings: [
                    ...STANDARD_CONTROLLER_USING,
                    `${namespace}${NameSpace.Model}`,
                    `${namespace}${NameSpace.Constants}`,
                    'RedQuickCore.Worker',
                    'Microsoft.AspNetCore.Mvc',
                    'RedQuick.Service.Data.Worker'
                ],
                namespace,
                space: NameSpace.Controllers
            })
        };
        return result;
    }
}
const StreamTypeTemplate = `
    public class WorkTasks 
    {
        public const string Long = "Long";
        public const string Fast = "Fast"; 
    }

    public class StreamTypeService : IStreamTypeService, IWorkTaskService, IWorkDistributionService
    {
        public int GetAnticipatedAgents()
        {
            return 16;
        }

        public IList<WorkerGroup> BuildWorkerGroups(IList<WorkerMinister> minister)
        {
            var result = new List<WorkerGroup>();
            var workGroup = WorkerGroup.BuildDefault(minister);
            result.Add(workGroup);
            return result;
        }

        public IList<string> GetStreamTypes()
        {
            return new List<string> {
                {{stream_types_list}}
             };
        }

        public IList<string> GetWorkTasks()
        {
            return new List<string> { WorkTasks.Long, WorkTasks.Fast };
        } 
        
        public IList<WorkerGroup> BuildWorkerGroups(IList<WorkerMinister> minister)
        {
            var result = new List<WorkerGroup>();

            var workGroup = WorkerGroup.BuildDefault(minister);
            result.Add(workGroup);
            return result;
        }
        
        public string GetWorkTaskFor(string streamType, string agentType, string changeType, string functionName) {
            return WorkTasks.Fast;
        }
}
`