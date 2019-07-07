
            var manyToMany = {{many_to_many}}.Create();
            manyToMany.{{ref1type}} = {{ref1}}.Id;
            manyToMany.{{ref2type}} = {{ref2}}.Id;
            manyToMany = await manyToManyArbiter.Create(manyToMany);
