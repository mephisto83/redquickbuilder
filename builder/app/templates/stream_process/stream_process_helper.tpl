

namespace Hero.Service.Data.Worker
{
    public class Distribution
    {
        public IList<string> Sieve { get; set; }
        public string Stream { get; set; }

        public static Distribution Create(IList<string> distribution, string stream)
        {
            return new Distribution
            {
                Stream = stream,
                Sieve = distribution.ToList()
            };
        }
        public static Distribution Create()
        {
            return new Distribution
            {
                Sieve = new List<string>()
            };
        }

        public static bool Ok(Distribution distribution)
        {
            return distribution != null && distribution.Sieve != null && distribution.Sieve.Count > 0;
        }

        public static void Merge(Distribution distribution1, Distribution distribution2)
        {
            foreach (var i in distribution2.Sieve)
            {
                if (!distribution1.Sieve.Contains(i))
                    distribution1.Sieve.Add(i);
            }
        }
    }
    public class WorkListItem
    {
        public static WorkListItem Create(string workTask, string stream, IList<string> distri)
        {
            return new WorkListItem()
            {
                WorkTask = workTask,
                Distribution = new Distribution
                {
                    Sieve = distri,
                    Stream = stream
                }
            };
        }

        public string WorkTask { get; set; }
        public Distribution Distribution { get; set; }

        public static void Merge(WorkListItem workItem, WorkListItem item)
        {
            Distribution.Merge(workItem.Distribution, item.Distribution);
        }

        internal static WorkListItem Create(WorkListItem item)
        {
            return new WorkListItem
            {
                WorkTask = item.WorkTask,
                Distribution = Distribution.Create(item.Distribution.Sieve, item.Distribution.Stream)
            };
        }
    }
    public class WorkLoad
    {
        public List<WorkListItem> Items { get; set; }
        public static WorkLoad Create()
        {
            return new WorkLoad()
            {
                Items = new List<WorkListItem>()
            };
        }
        public override string ToString()
        {
            var result = string.Empty;
            this.Items = this.Items ?? new List<WorkListItem>();
            foreach (var i in this.Items)
            {
                result += i.WorkTask;
                result += "-sieve-";
                result += i?.Distribution?.Stream;
                result += "-stream-";
                foreach (var t in i?.Distribution?.Sieve)
                {
                    result += "-" + t;
                }
            }

            return result;
        }
        public static bool Collect(WorkLoad workLoad, WorkListItem item)
        {
            workLoad.Items = workLoad.Items ?? new List<WorkListItem>();
            var workItem = workLoad.Items.FirstOrDefault(x => x.WorkTask == item.WorkTask && x.Distribution.Stream == item.Distribution.Stream);
            if (workItem != null)
            {
                WorkListItem.Merge(workItem, item);
            }
            else if (!workLoad.Items.Any(x => x.WorkTask == item.WorkTask))
            {
                workLoad.Items.Add(WorkListItem.Create(item));
            }
            else
            {
                return false;
            }

            return true;
        }
    }
}

public static class DataExt {

    
        public static Expression<Func<T, bool>> RedCreateExpression<T>(Distribution distribution)
            where T : DBaseData
        {
            Expression<Func<T, bool>> expression = null;
            foreach (var m in distribution.Sieve)
            {
                Expression<Func<T, bool>> funct = (c) => (c.Id.StartsWith(m));
                if (expression == null)
                {
                    expression = funct;
                }
                else
                {
                    expression = expression.Or(funct);
                }
            }

            return expression;
        }

        public static Expression<Func<T, bool>> ToExpression<T>(this Distribution distribution)
                 where T : HeroDataBase
        {
            return CreateExpression<T>(distribution);
        }

        public static Expression<Func<T, bool>> RedExpression<T>(this Distribution distribution)
                 where T : DBaseData
        {
            return RedCreateExpression<T>(distribution);
        }

}