            var arbiter = RedStrapper.Resolve<IRedArbiter<{{model}}>>();
            var result =  await arbiter.Get(value.Id);

{{property_sets}}

            return result;