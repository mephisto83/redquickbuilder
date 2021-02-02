    public class StreamProcess
    {

        
{{static_methods}}

        static async Task<U> Stream<T, U>(T change, bool noWait = false)
            where T : StagedChanged
            where U : StagedResponse
        {
            IRedArbiter<U> stagedResponseArbiter = RedStrapper.Resolve<IRedArbiter<U>>();
            IRedArbiter<T> stagedChangeArbiter = RedStrapper.Resolve<IRedArbiter<T>>();
            IStreamProcessOrchestration orchestration = RedStrapper.Resolve<IStreamProcessOrchestration>();
            change = await stagedChangeArbiter.Create(change);
            U stagedChangeResponse = null;

            if (RedConfiguration.SingleThread)
            {
                await orchestration.ProcessStagedChanges();
                if (!noWait)
                {
                    stagedChangeResponse = (await stagedResponseArbiter.GetBy(x => x.Response == change.Response)).FirstOrDefault();
                    await stagedResponseArbiter.Delete(stagedChangeResponse.Id);
                }

            }
            else if (RedConfiguration.MultiThreaded)
            {
                var agentCenter = RedStrapper.Resolve<IRedAgentCenter>();

                stagedChangeResponse = await agentCenter.Send<T, U>(change, noWait);
                if (!noWait)
                {
                    await stagedResponseArbiter.Delete(stagedChangeResponse.Id);
                }
            }
            else
            {
                IRedEventHubClient client = RedStrapper.Resolve<IRedEventHubClient>();
                var workerMinisterArbiter = RedStrapper.Resolve<IWorkMinister>();
                var hubName = await workerMinisterArbiter.GetWorkerEventHubName(change.StreamType);
                if (!string.IsNullOrEmpty(hubName))
                {
                    await client.SendAsync(hubName, string.Empty);
                }

                if (!noWait)
                {
                    stagedChangeResponse = (await stagedResponseArbiter.GetBy(x => x.Response == change.Response)).FirstOrDefault();
                    var maxcount = 120;

                    while (stagedChangeResponse == null && maxcount >= 0)
                    {
                        maxcount--;
                        stagedChangeResponse = (await stagedResponseArbiter.GetBy(x => x.Response == change.Response)).FirstOrDefault();
                        if (stagedChangeResponse == null)
                        {
                            Thread.Sleep(1000);
                        }
                    }
                }
            }

            return stagedChangeResponse;
        }

        internal static async Task Pump()
        {
            var workerMinisterArbiter = RedStrapper.Resolve<IWorkMinister>();
            var streamTypes = Helper.GetConstantValues<StreamType>();
            var hubs = new List<string>();
            foreach (var typ in streamTypes)
            {
                var hubName = await workerMinisterArbiter.GetWorkerEventHubName(typ);
                if (!string.IsNullOrEmpty(hubName) && !hubs.Contains(hubName))
                {
                    hubs.Add(hubName);
                }
            }

            IRedEventHubClient client = RedStrapper.Resolve<IRedEventHubClient>();
            foreach (var hubName in hubs)
            {
                if (!string.IsNullOrEmpty(hubName))
                {
                    await client.SendAsync(hubName, string.Empty);
                }
            }

        }
    }
