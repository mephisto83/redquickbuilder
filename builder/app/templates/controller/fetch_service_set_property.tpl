                if(obj.ContainsKey("{{model_output}}")) {
                  var temp_{{model_output#lower}} = (await {{controller#lower}}.{{functionName}}(obj["{{model_output}}"]));
                  result.{{model_output}} = {{model_output}}.Merge(result.{{model_output}}, (temp_{{model_output#lower}}.Result as OkObjectResult).Value as IList<{{model_output}}>);
                }
