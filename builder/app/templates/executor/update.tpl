            var arbiter = RedStrapper.Resolve<IRedArbiter<{{model}}>>();
            var result =  await arbiter.Get<{{model}}>(data.Id);

{{property_sets}}

            return result;