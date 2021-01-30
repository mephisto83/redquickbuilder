using Microsoft.AspNetCore.Mvc;
using RedQuick.Util;
using RedQuickCore.BackgroundAgent;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace {{namespace}}.Agent.Controllers
{
    [ApiController]
    [Route("work")]
    public class RedWorkAgentController : Controller
    {
        WorkerMinisterMessageChannel ministerChannel;
        IBackgroundReplyService backgroundReplyService;
        public RedWorkAgentController(WorkerMinisterMessageChannel _ministerChannel)
        {
            ministerChannel = _ministerChannel;
            backgroundReplyService = RedStrapper.Resolve<IBackgroundReplyService>();
        }
        [HttpGet("heart")]
        public async Task<ConfirmationResult> Heart()
        {
            return ConfirmationResult.Confirming();
        }

        [HttpPost("change/{workstate}")]
        public async Task<ChangeResult> Change([FromBody] WorkerMinisterMessage message, string workstate, CancellationToken stoppingToken)
        {
            Task<ChangeResult> res = await Handle<ChangeResult>(message, stoppingToken);
            return await res;
        }

        private async Task<Task<T>> Handle<T>(WorkerMinisterMessage message, CancellationToken stoppingToken)
        {
            var internalId = Guid.NewGuid().ToString();
            message.InternalRequestId = internalId;
            var res = backgroundReplyService.RegisterWait(internalId, (T result) =>
            {
                return result;
            });
            await ministerChannel.Writer.WriteAsync(message, stoppingToken);
            return res;
        }
    }
}
