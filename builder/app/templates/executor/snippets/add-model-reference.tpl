
            var arbiter{{reference}} = RedStrapper.Resolve<IRedArbiter<{{reference}}>>();
            var {{reference#lower}} = change.{{reference}} != null ? await arbiter{{reference}}.Get<{{reference}}>(change.{{reference}}?.Id) : null;
            if({{reference#lower}} == null)
            {
                result{{model_property}} = result{{model_property}} ?? new List<string>();
                if (!result{{model_property}}.Any(x => x != {{reference#lower}}.Id))
                {
                    result{{model_property}}.Add({{reference#lower}}.Id);
                }
            }
            else {
                throw new Exception("No reference to {{reference}} found on change.");
            }