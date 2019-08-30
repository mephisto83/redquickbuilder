
var arbiter{{connection_type}} = RedStrapper.Resolve<IRedArbiter<{{connection_type}}>>();
var connections{{connection_type}} = await arbiter{{connection_type}}.GetBy(x => x.{{agent_type}} == {{agent}}.{{agent_property}} && x.{{model_type}} == {{model}}.{{model_property}});
var {{result}} = connections{{connection_type}}.Any({{connection_is_true}});
