
var arbiter{{connection_type}} = RedStrapper.Resolve<IRedArbiter<{{connection_type}}>>();
var connections{{connection_type}} = await arbiter{{connection_type}}.Get(x => x.{{agent}} == {{agent}}.{{agent_property}} && x.{{model}} == {{model}}.{{model_property}});
var {{result}} = connections{{connection_type}}.Any(_x => _x.{{connection_property}} == {{connection_value}});
