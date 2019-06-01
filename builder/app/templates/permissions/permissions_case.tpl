{{instance_list}}

var can{{method}}{{model}}{{casename}} = {{allowed-values-list}}.Select(t => {{extension}}.List().FirstOrDefault(x=> x.{{extension_propery_key}} == t)).Where(x=> x !== null).Select(x=> x.{{extension_value_property}}).Any(x => x === value.{{value_property}});