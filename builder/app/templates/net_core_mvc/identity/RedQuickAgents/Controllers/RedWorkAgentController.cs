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
    public class RedWorkAgentController : WorkerController
    {
        WorkerMinisterMessageChannel ministerChannel;
        IBackgroundReplyService backgroundReplyService;
        public RedWorkAgentController(WorkerMinisterMessageChannel _ministerChannel)
            : base(_ministerChannel)
        {
        }
        [HttpGet("heart")]
        public async Task<ConfirmationResult> Heart()
        {
            return ConfirmationResult.Confirming();
        }

        [AllowAnonymous]
        [HttpPost("work")]
        public async Task<ValidResult> Work([FromBody] WorkerMinisterMessage message, CancellationToken stoppingToken)
        {
            Task<ValidResult> res = await Handle<ValidResult>(message, stoppingToken);

            return await res;
        }

        [HttpPost("change")]
        public async Task<ChangeResult> Change([FromBody] WorkerMinisterMessage message, CancellationToken stoppingToken)
        {
            Task<ChangeResult> res = await Handle<ChangeResult>(message, stoppingToken);
            return await res;
        }
    }
}
