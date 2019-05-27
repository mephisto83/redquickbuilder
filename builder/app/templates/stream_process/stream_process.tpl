    public class StreamProcess
    {
        public static Boolean InProcess = false;
        
        public static async Task<StagedResponse> ServiceTask(StagedChanged change, bool noWait = false)
        {
            change.StreamType = StreamType.SERVICE_TASK;
            var stagedChangeResponse = await Stream(change, noWait);
            return stagedChangeResponse;
        }
        
        {{static_methods}}

        static async Task<StagedResponse> Stream(StagedChanged change, bool noWait = false)
        {
            InProcess = true;
            IRedArbiter<StagedResponse> stagedResponseArbiter = RedStrapper.Resolve<IRedArbiter<StagedResponse>>();
            IRedArbiter<StagedChanged> stagedChangeArbiter = RedStrapper.Resolve<IRedArbiter<StagedChanged>>();
            IStagedChangesOrchestration orchestration = ProjectStrapper.Resolve<IStagedChangesOrchestration>();
            change = await stagedChangeArbiter.Create(change);
            StagedResponse stagedChangeResponse = null;

            if (HeroConfiguration.SingleThread)
            {
                await orchestration.ProcessStagedChanges();
                if (!noWait)
                {
                    stagedChangeResponse = (await stagedResponseArbiter.GetBy(x => x.Response == change.Response)).FirstOrDefault();
                    await stagedResponseArbiter.Delete(stagedChangeResponse.Id);
                }

            }
            else
            {
                IHeroEventHubClient client = ProjectStrapper.Resolve<IHeroEventHubClient>();
                var workerMinisterArbiter = ProjectStrapper.Resolve<IWorkMinister>();
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

            InProcess = false;
            return stagedChangeResponse;
        }

        internal static async Task Pump()
        {
            var workerMinisterArbiter = ProjectStrapper.Resolve<IWorkMinister>();
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

            IHeroEventHubClient client = ProjectStrapper.Resolve<IHeroEventHubClient>();
            foreach (var hubName in hubs)
            {
                if (!string.IsNullOrEmpty(hubName))
                {
                    await client.SendAsync(hubName, string.Empty);
                }
            }

        }
    }